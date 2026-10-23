import { visibleContent } from "./moderation.js";
import type { Context, Hono } from "hono";
import { z } from "zod";
import {
  categories,
  spotSchema,
  quizFingerprint,
  publicQuiz,
  canReadSpot,
  type Profile,
  type MapSpot,
  type SpotQuiz,
} from "@repere/core";
import { pool, transaction, type DB } from "./db.js";
import { ApiError, owner, writer, type Env } from "./security.js";

export async function readSpot(db: DB, p: Profile, id: string, lock = false) {
  const { rows } = await db.query(
    `SELECT s.*, EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.teacher_id=s.author_id AND ts.student_id=$2 AND s.share_with_students) AS shared FROM map_spots s WHERE s.id=$1${lock ? " FOR SHARE OF s" : ""}`,
    [id, p.id],
  );
  if (!rows[0] || !canReadSpot(p, rows[0]))
    throw new ApiError(404, "Repère introuvable ou partage retiré.");
  return rows[0];
}
export function spotView(s: any, p: Profile, summary = false) {
  const reveal = p.role === "admin" || p.id === s.author_id;
  return {
    id: s.id,
    authorId: s.author_id,
    name: s.name,
    category: s.category,
    lat: s.lat,
    lng: s.lng,
    note: s.quiz && !reveal ? "" : s.note,
    status: s.status,
    shareWithStudents: s.share_with_students,
    photos: summary ? [] : s.photos || [],
    photoCount: s.photo_count ?? (s.photos || []).length,
    quiz: publicQuiz(s.quiz, reveal),
    quizVersion: s.quiz_version,
    ...(reveal && s.source_route_id
      ? { sourceRouteId: s.source_route_id }
      : {}),
  };
}
export async function saveCatalogSpot(db: DB, p: Profile, s: MapSpot) {
  writer(p);
  // Serialize creation as well as edits; a UUID collision must not bypass ownership.
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    s.id,
  ]);
  const { rows } = await db.query(
    "SELECT * FROM map_spots WHERE id=$1 FOR UPDATE",
    [s.id],
  );
  const prior = rows[0];
  if (prior) owner(p, prior.author_id);
  if (prior?.archived_at)
    throw new ApiError(
      409,
      "Ce repère a été archivé. Créez un nouveau repère.",
    );
  let sourceAuthor: string | undefined;
  if (s.sourceRouteId) {
    const route = await db.query("SELECT author_id FROM routes WHERE id=$1", [
      s.sourceRouteId,
    ]);
    if (route.rows[0]) {
      owner(p, route.rows[0].author_id);
      sourceAuthor = route.rows[0].author_id;
    }
  }
  const photos: NonNullable<MapSpot["photos"]> =
    s.photos ?? prior?.photos ?? [];
  if (new Set(photos.map((ph) => ph.id)).size !== photos.length)
    throw new ApiError(400, "Photographies dupliquées.");
  const quiz: SpotQuiz | null =
    s.quiz === undefined ? prior?.quiz || null : s.quiz;
  if (
    quiz &&
    (quiz.answer === undefined ||
      quiz.answer >= quiz.options.length ||
      !quiz.explanation?.trim())
  )
    throw new ApiError(
      400,
      "Indiquez la bonne réponse et son explication avant d’activer le quiz.",
    );
  const changed = quizFingerprint(quiz) !== quizFingerprint(prior?.quiz);
  if (
    s.quizVersion !== undefined &&
    prior &&
    s.quizVersion !== prior.quiz_version &&
    changed
  )
    throw new ApiError(
      409,
      "Le quiz a été modifié depuis son ouverture. Rechargez le repère.",
    );
  const version = (prior?.quiz_version || 0) + (changed ? 1 : 0);
  const saved = await db.query(
    `INSERT INTO map_spots(id,author_id,name,category,lat,lng,note,status,photos,share_with_students,quiz,quiz_version,source_route_id)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11::jsonb,$12,$13)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,lat=excluded.lat,lng=excluded.lng,note=excluded.note,status=excluded.status,photos=excluded.photos,share_with_students=excluded.share_with_students,quiz=excluded.quiz,quiz_version=excluded.quiz_version,source_route_id=COALESCE(excluded.source_route_id,map_spots.source_route_id),updated_at=now() RETURNING *`,
    [
      s.id,
      prior?.author_id || sourceAuthor || p.id,
      s.name,
      s.category,
      s.lat,
      s.lng,
      s.note,
      s.status,
      JSON.stringify(photos),
      s.shareWithStudents ?? prior?.share_with_students ?? false,
      quiz ? JSON.stringify(quiz) : null,
      version,
      s.sourceRouteId || null,
    ],
  );
  await db.query(
    "UPDATE spot_media SET archived_at=now() WHERE spot_id=$1 AND NOT(id=ANY($2::uuid[])) AND archived_at IS NULL",
    [s.id, photos.map((ph) => ph.id)],
  );
  for (const [index, ph] of photos.entries()) {
    await db.query(
      `INSERT INTO spot_media(spot_id,id,position,mime_type,width,height,caption) VALUES($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT(spot_id,id) DO UPDATE SET position=excluded.position,mime_type=excluded.mime_type,width=excluded.width,height=excluded.height,caption=excluded.caption,archived_at=NULL`,
      [
        s.id,
        ph.id,
        index,
        ph.dataUrl.slice(5, ph.dataUrl.indexOf(";")),
        ph.width || null,
        ph.height || null,
        ph.caption || "",
      ],
    );
  }
  if (changed && quiz)
    await db.query(
      `INSERT INTO spot_quiz_versions(spot_id,version,question,options,answer,explanation) VALUES($1,$2,$3,$4::jsonb,$5,$6)`,
      [
        s.id,
        version,
        quiz.question,
        JSON.stringify(quiz.options),
        quiz.answer,
        quiz.explanation,
      ],
    );
  return saved.rows[0];
}

export async function recordSharedRouteAttempt(
  p: Profile,
  q: any,
  attemptId: string,
  answer: number,
) {
  if (p.role !== "student") return;
  await transaction(async (db) => {
    let spot: any;
    try {
      spot = await readSpot(db, p, q.id, true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return;
      throw e;
    }
    const quiz = {
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    };
    const matching = await db.query(
      "SELECT version FROM spot_quiz_versions WHERE spot_id=$1 AND question=$2 AND options=$3::jsonb AND answer=$4 AND explanation=$5 ORDER BY version DESC LIMIT 1",
      [
        q.id,
        quiz.question,
        JSON.stringify(quiz.options),
        quiz.answer,
        quiz.explanation,
      ],
    );
    if (!matching.rows[0]) return;
    const quizVersion = matching.rows[0].version;
    const result = await db.query(
      `INSERT INTO spot_quiz_attempts(id,spot_id,quiz_version,student_id,answer_index,correct,name_snapshot,category_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO NOTHING RETURNING id`,
      [
        attemptId,
        q.id,
        quizVersion,
        p.id,
        answer,
        answer === q.answer,
        spot.name,
        spot.category,
      ],
    );
    if (!result.rowCount) {
      const x = (
        await db.query("SELECT * FROM spot_quiz_attempts WHERE id=$1", [
          attemptId,
        ])
      ).rows[0];
      if (
        x.student_id !== p.id ||
        x.spot_id !== q.id ||
        x.answer_index !== answer
      )
        throw new ApiError(409, "Identifiant de réponse déjà utilisé.");
    }
  });
}

export function installLearning(app: Hono<Env>) {
  app.get("/v1/spots", async (c) => {
    const p = c.get("profile");
    const summary=c.req.query("summary")==="1";
    const columns=summary?"s.id,s.author_id,s.name,s.category,s.lat,s.lng,s.note,s.status,s.share_with_students,s.quiz,s.quiz_version,s.source_route_id,jsonb_array_length(s.photos) AS photo_count":"s.*";
    const { rows } = await pool.query(
      `SELECT ${columns} FROM map_spots s WHERE ${visibleContent('s','spot')} AND s.archived_at IS NULL AND (s.author_id=$1 OR s.status='published' OR $2='admin' OR (s.share_with_students AND EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.teacher_id=s.author_id AND ts.student_id=$1))) ORDER BY s.created_at DESC LIMIT 1000`,
      [p.id, p.role],
    );
    const archived = await pool.query(
      `SELECT s.id FROM map_spots s WHERE s.archived_at IS NOT NULL AND (s.author_id=$1 OR s.status='published' OR $2='admin' OR (s.share_with_students AND EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.teacher_id=s.author_id AND ts.student_id=$1)) OR EXISTS(SELECT 1 FROM routes r WHERE r.id=s.source_route_id AND (r.status='published' OR EXISTS(SELECT 1 FROM assignments a WHERE a.route_id=r.id AND a.student_id=$1))))`,
      [p.id, p.role],
    );
    return c.json({
      spots: rows.map((s) => spotView(s, p, c.req.query("summary") === "1")),
      archivedIds: archived.rows.map((s) => s.id),
    });
  });
  app.get("/v1/spots/:id", async (c) =>
    c.json(
      spotView(
        await readSpot(
          pool,
          c.get("profile"),
          z.uuid().parse(c.req.param("id")),
        ),
        c.get("profile"),
      ),
    ),
  );
  const save = async (c: Context<Env>) => {
    const p = c.get("profile");
    writer(p);
    const s = spotSchema.parse(await c.req.json());
    if (s.id !== c.req.param("id"))
      throw new ApiError(400, "Identifiant incohérent.");
    const result = await transaction((db) =>
      saveCatalogSpot(db, p, { ...s, authorId: p.id }),
    );
    return c.json(spotView(result, p));
  };
  app.put("/v1/spots/:id", save);
  app.post("/v1/spots/:id/save", save);
  const archive = async (c: Context<Env>) => {
    const p = c.get("profile");
    writer(p);
    const id = z.uuid().parse(c.req.param("id"));
    const payload =
      c.req.method === "POST" ? await c.req.json().catch(() => ({})) : {};
    await transaction(async (db) => {
      await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        id,
      ]);
      const { rows } = await db.query(
        "SELECT author_id FROM map_spots WHERE id=$1 FOR UPDATE",
        [id],
      );
      if (!rows[0] && payload.spot) {
        const spot = spotSchema.parse(payload.spot);
        if (spot.id !== id) throw new ApiError(400, "Identifiant incohérent.");
        const pointOwner = await db.query(
          "SELECT r.author_id FROM pedagogical_points q JOIN routes r ON r.id=q.route_id WHERE q.id=$1",
          [id],
        );
        if (pointOwner.rows[0]) owner(p, pointOwner.rows[0].author_id);
        await saveCatalogSpot(db, p, {
          ...spot,
          photos: [],
          quiz: null,
          authorId: p.id,
        });
        rows.push({ author_id: pointOwner.rows[0]?.author_id || p.id });
      }
      if (rows[0]) {
        owner(p, rows[0].author_id);
        await db.query(
          "UPDATE map_spots SET archived_at=now(),updated_at=now() WHERE id=$1",
          [id],
        );
      }
    });
    return c.json({ ok: true });
  };
  app.delete("/v1/spots/:id", archive);
  app.post("/v1/spots/:id/archive", archive);
  app.post("/v1/spots/:id/activity", async (c) => {
    const p = c.get("profile");
    if (p.role !== "student") return c.json({ ignored: true });
    const id = z.uuid().parse(c.req.param("id"));
    const event = z
      .object({
        eventId: z.uuid(),
        kind: z.enum(["opened", "photo_viewed"]),
        photoId: z.uuid().optional(),
      })
      .parse(await c.req.json());
    if ((event.kind === "photo_viewed") !== !!event.photoId)
      throw new ApiError(400, "Photographie incohérente.");
    await transaction(async (db) => {
      const prior = await db.query("SELECT * FROM spot_activity WHERE id=$1", [
        event.eventId,
      ]);
      if (prior.rows[0]) {
        const x = prior.rows[0];
        if (
          x.spot_id !== id ||
          x.student_id !== p.id ||
          x.kind !== event.kind ||
          (x.photo_id || null) !== (event.photoId || null)
        )
          throw new ApiError(409, "Identifiant de consultation déjà utilisé.");
        return;
      }
      await readSpot(db, p, id, true);
      if (event.photoId) {
        const media = await db.query(
          "SELECT 1 FROM spot_media WHERE spot_id=$1 AND id=$2 AND archived_at IS NULL",
          [id, event.photoId],
        );
        if (!media.rowCount)
          throw new ApiError(400, "Photographie introuvable.");
      }
      const saved = await db.query(
        "INSERT INTO spot_activity(id,spot_id,student_id,kind,photo_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING RETURNING id",
        [event.eventId, id, p.id, event.kind, event.photoId || null],
      );
      if (!saved.rowCount) {
        const x = (
          await db.query("SELECT * FROM spot_activity WHERE id=$1", [
            event.eventId,
          ])
        ).rows[0];
        if (
          x.spot_id !== id ||
          x.student_id !== p.id ||
          x.kind !== event.kind ||
          (x.photo_id || null) !== (event.photoId || null)
        )
          throw new ApiError(409, "Identifiant de consultation déjà utilisé.");
      }
    });
    return c.json({ ok: true });
  });
  app.post("/v1/spots/:id/quiz", async (c) => {
    const p = c.get("profile");
    if (p.role !== "student")
      throw new ApiError(
        403,
        "Les résultats sont enregistrés pour les élèves uniquement.",
      );
    const id = z.uuid().parse(c.req.param("id"));
    const a = z
      .object({
        attemptId: z.uuid(),
        version: z.number().int().positive(),
        answer: z.number().int().min(0).max(5),
      })
      .parse(await c.req.json());
    const result = await transaction(async (db) => {
      const prior = await db.query(
        "SELECT * FROM spot_quiz_attempts WHERE id=$1",
        [a.attemptId],
      );
      if (prior.rows[0]) {
        const x = prior.rows[0];
        if (
          x.spot_id !== id ||
          x.student_id !== p.id ||
          x.quiz_version !== a.version ||
          x.answer_index !== a.answer
        )
          throw new ApiError(409, "Identifiant de réponse déjà utilisé.");
        const q = (
          await db.query(
            "SELECT * FROM spot_quiz_versions WHERE spot_id=$1 AND version=$2",
            [id, a.version],
          )
        ).rows[0];
        return {
          correct: x.correct,
          answer: q.answer,
          explanation: q.explanation,
          version: a.version,
        };
      }
      const spot = await readSpot(db, p, id, true);
      if (!spot.quiz)
        throw new ApiError(400, "Ce repère ne propose pas de quiz.");
      if (spot.quiz_version !== a.version)
        throw new ApiError(
          409,
          "Cette question a changé. Fermez puis rouvrez le repère.",
        );
      const q = spot.quiz;
      if (a.answer >= q.options.length)
        throw new ApiError(400, "Réponse invalide.");
      const saved = await db.query(
        `INSERT INTO spot_quiz_attempts(id,spot_id,quiz_version,student_id,answer_index,correct,name_snapshot,category_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO NOTHING RETURNING id`,
        [
          a.attemptId,
          id,
          a.version,
          p.id,
          a.answer,
          a.answer === q.answer,
          spot.name,
          spot.category,
        ],
      );
      if (!saved.rowCount) {
        const x = (
          await db.query("SELECT * FROM spot_quiz_attempts WHERE id=$1", [
            a.attemptId,
          ])
        ).rows[0];
        if (
          x.spot_id !== id ||
          x.student_id !== p.id ||
          x.quiz_version !== a.version ||
          x.answer_index !== a.answer
        )
          throw new ApiError(409, "Identifiant de réponse déjà utilisé.");
      }
      return {
        correct: a.answer === q.answer,
        answer: q.answer,
        explanation: q.explanation,
        version: a.version,
      };
    });
    return c.json(result);
  });

  app.get("/v1/learning/stats", async (c) => {
    const p = c.get("profile");
    const to = c.req.query("to") || new Date().toISOString(),
      from =
        c.req.query("from") ||
        new Date(Date.now() - 30 * 86400000).toISOString();
    const start = Date.parse(from),
      end = Date.parse(to);
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start >= end ||
      end - start > 366 * 86400000
    )
      throw new ApiError(
        400,
        "Choisissez une période valide de 366 jours maximum.",
      );
    const category = c.req.query("category")
      ? z.enum(categories).parse(c.req.query("category"))
      : null;
    const studentId = c.req.query("studentId") || null,
      spotId = c.req.query("spotId")
        ? z.uuid().parse(c.req.query("spotId"))
        : null;
    if (studentId && studentId.length > 200)
      throw new ApiError(400, "Identifiant d’élève invalide.");
    if (p.role === "student" && studentId && studentId !== p.id)
      throw new ApiError(403, "Votre historique uniquement.");
    const args = [
      p.id,
      p.role,
      new Date(start).toISOString(),
      new Date(end).toISOString(),
      category,
      studentId,
      spotId,
    ];
    const common = `WITH scope AS (
      SELECT s.* FROM map_spots s WHERE ($2='admin' OR ($2='teacher' AND s.author_id=$1) OR ($2='student' AND (EXISTS(SELECT 1 FROM spot_activity e WHERE e.spot_id=s.id AND e.student_id=$1) OR EXISTS(SELECT 1 FROM spot_quiz_attempts q WHERE q.spot_id=s.id AND q.student_id=$1)))) AND ($5::text IS NULL OR s.category=$5) AND ($7::uuid IS NULL OR s.id=$7)
    ), activity AS (
      SELECT e.* FROM spot_activity e JOIN scope s ON s.id=e.spot_id WHERE e.created_at >= $3::timestamptz AND e.created_at < $4::timestamptz AND ($2<>'student' OR e.student_id=$1) AND ($6::text IS NULL OR e.student_id=$6)
    ), ranked AS (
      SELECT q.*,row_number() OVER(PARTITION BY q.spot_id,q.quiz_version,q.student_id ORDER BY q.created_at,q.id) AS ordinal FROM spot_quiz_attempts q JOIN scope s ON s.id=q.spot_id WHERE ($2<>'student' OR q.student_id=$1) AND ($6::text IS NULL OR q.student_id=$6)
    ), attempts AS (SELECT * FROM ranked WHERE created_at >= $3::timestamptz AND created_at < $4::timestamptz)
    `;
    const [spots, students, totals] = await Promise.all([
      pool.query(
        common +
          `SELECT s.id,s.name,s.category,(s.archived_at IS NOT NULL) archived,
        COALESCE(e.views,0)::int views,COALESCE(e.photo_views,0)::int "photoViews",COALESCE(e.viewers,0)::int "uniqueViewers",
        COALESCE(q.attempts,0)::int attempts,COALESCE(q.first_attempts,0)::int "firstAttempts",COALESCE(q.first_correct,0)::int "firstCorrect"
        FROM scope s LEFT JOIN (SELECT spot_id,count(*) FILTER(WHERE kind='opened') views,count(*) FILTER(WHERE kind='photo_viewed') photo_views,count(DISTINCT student_id) FILTER(WHERE kind='opened') viewers FROM activity GROUP BY spot_id) e ON e.spot_id=s.id
        LEFT JOIN (SELECT spot_id,count(*) attempts,count(*) FILTER(WHERE ordinal=1) first_attempts,count(*) FILTER(WHERE ordinal=1 AND correct) first_correct FROM attempts GROUP BY spot_id) q ON q.spot_id=s.id ORDER BY COALESCE(q.attempts,0) DESC,COALESCE(e.views,0) DESC,s.name,s.id`,
        args,
      ),
      pool.query(
        common +
          `SELECT u.id,u.name,
        (SELECT count(*)::int FROM activity e WHERE e.student_id=u.id AND e.kind='opened') views,
        (SELECT count(*)::int FROM activity e WHERE e.student_id=u.id AND e.kind='photo_viewed') "photoViews",
        (SELECT count(DISTINCT spot_id)::int FROM activity e WHERE e.student_id=u.id AND e.kind='opened') "spotsViewed",
        (SELECT count(*)::int FROM attempts q WHERE q.student_id=u.id) attempts,
        (SELECT count(*)::int FROM attempts q WHERE q.student_id=u.id AND ordinal=1) "firstAttempts",
        (SELECT count(*)::int FROM attempts q WHERE q.student_id=u.id AND ordinal=1 AND correct) "firstCorrect",
        (SELECT max(t.created_at) FROM (SELECT created_at FROM activity WHERE student_id=u.id UNION ALL SELECT created_at FROM attempts WHERE student_id=u.id) t) "lastActivity"
        FROM users u WHERE u.id IN (SELECT student_id FROM activity UNION SELECT student_id FROM attempts) ORDER BY u.name,u.id`,
        args,
      ),
      pool.query(
        common +
          `SELECT (SELECT count(*)::int FROM activity WHERE kind='opened') views,(SELECT count(*)::int FROM activity WHERE kind='photo_viewed') "photoViews",(SELECT count(*)::int FROM attempts) attempts,(SELECT count(*)::int FROM attempts WHERE ordinal=1) "firstAttempts",(SELECT count(*)::int FROM attempts WHERE ordinal=1 AND correct) "firstCorrect",(SELECT count(*)::int FROM (SELECT student_id FROM activity UNION SELECT student_id FROM attempts) learners) students`,
        args,
      ),
    ]);
    return c.json({
      period: { from: args[2], to: args[3] },
      totals: totals.rows[0],
      spots: spots.rows,
      students: students.rows,
    });
  });
}
