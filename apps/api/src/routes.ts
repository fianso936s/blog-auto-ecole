import { visibleContent } from "./moderation.js";
import {
  installLearning,
  saveCatalogSpot,
  recordSharedRouteAttempt,
} from "./learning.js";
import type { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  routeSchema,
  spotSchema,
  totalDistance,
  geometry,
  type Profile,
  type Route,
  type Point,
} from "@repere/core";
import { pool, transaction, type DB } from "./db.js";
import {
  ApiError,
  owner,
  readable,
  writer,
  hash,
  type Env,
} from "./security.js";
export async function fullRoute(
  db: DB,
  p: Profile,
  id: string,
): Promise<Route> {
  const r = await readable(db, p, id);
  const [{ rows: fixes }, { rows: points }, { rows: photos }, { rows: stats }] =
    await Promise.all([
      db.query(
        'SELECT lat,lng,accuracy,extract(epoch FROM recorded_at)*1000 time,segment,recorded_time_known AS "timeKnown" FROM gps_coordinates WHERE route_id=$1 ORDER BY seq',
        [id],
      ),
      db.query(
        "SELECT p.* FROM pedagogical_points p WHERE p.route_id=$1 AND NOT EXISTS(SELECT 1 FROM map_spots s WHERE s.id=p.id AND s.archived_at IS NOT NULL) ORDER BY p.fix_index,p.id",
        [id],
      ),
      db.query(
        "SELECT ph.* FROM photographs ph JOIN pedagogical_points p ON p.id=ph.point_id WHERE p.route_id=$1",
        [id],
      ),
      db.query(
        "SELECT EXISTS(SELECT 1 FROM favorites WHERE route_id=$1 AND user_id=$2) favorite,COALESCE((SELECT fix_index FROM progress WHERE route_id=$1 AND student_id=$2),0) progress",
        [id, p.id],
      ),
    ]);
  const reveal = p.role === "admin" || p.id === r.author_id;
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    examCenter: r.exam_center || "",
    difficulty: r.difficulty,
    status: r.status,
    source: r.source,
    duration: r.duration,
    distance: r.distance,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
    authorId: r.author_id,
    authorName: r.author_name,
    version: r.version,
    favorite: stats[0].favorite,
    progress: stats[0].progress,
    fixes: fixes.map((f) => ({ ...f, time: Math.round(Number(f.time)) })),
    points: points.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      lat: p.latitude ?? fixes[p.fix_index]?.lat ?? 0,
      lng: p.longitude ?? fixes[p.fix_index]?.lng ?? 0,
      fixIndex: p.fix_index,
      shareWithStudents: p.share_with_students,
      question: p.question,
      options: p.options,
      ...(reveal ? { answer: p.answer } : {}),
      ...(reveal || !p.validated_by || !p.question
        ? { explanation: p.explanation }
        : {}),
      validated: !!p.validated_by,
      photos: photos
        .filter((ph) => ph.point_id === p.id)
        .map((ph) => ({ id: ph.id, dataUrl: ph.data_url })),
    })),
  };
}
export async function saveRoute(p: Profile, raw: unknown, writeKey?: string) {
  writer(p);
  const r = routeSchema.parse(raw);
  const writeHash = hash(JSON.stringify(r));
  if (writeKey && !/^[a-f0-9-]{36}:\d{1,10}$/.test(writeKey))
    throw new ApiError(400, "Identifiant de synchronisation invalide.");
  const distance = totalDistance(r.fixes),
    geo = geometry(r.fixes);
  return transaction(async (db) => {
    // A stale offline route must never resurrect a marker deleted from the map.
    const archived = await db.query(
      "SELECT id FROM map_spots WHERE id=ANY($1::uuid[]) AND archived_at IS NOT NULL",
      [r.points.map((q) => q.id)],
    );
    const removed = new Set(archived.rows.map((q) => q.id));
    r.points = r.points.filter((q) => !removed.has(q.id));
    const { rows } = await db.query(
      "SELECT * FROM routes WHERE id=$1 FOR UPDATE",
      [r.id],
    );
    if (rows[0]) {
      owner(p, rows[0].author_id);
      if (writeKey && rows[0].mobile_write_key === writeKey) {
        if (rows[0].mobile_write_hash !== writeHash)
          throw new ApiError(
            409,
            "Cette révision contient déjà une autre modification.",
          );
        return fullRoute(db, p, r.id);
      }
      if (rows[0].version !== r.version)
        throw new ApiError(
          409,
          "Ce parcours a été modifié sur un autre appareil. Conservez votre version comme copie.",
        );
    } else if (r.version !== 0)
      throw new ApiError(
        409,
        "Le parcours a été supprimé. Vous pouvez enregistrer une copie.",
      );
    const collisions = await db.query(
      "SELECT id FROM pedagogical_points WHERE id=ANY($1::uuid[]) AND route_id<>$2",
      [r.points.map((p) => p.id), r.id],
    );
    if (collisions.rowCount)
      throw new ApiError(
        409,
        "Un identifiant de point appartient à un autre parcours.",
      );
    if (rows[0])
      await db.query(
        "UPDATE routes SET name=$2,description=$3,difficulty=$4,status=$5,duration=$6,distance=$7,geometry=$8,exam_center=COALESCE($9,exam_center),version=version+1,updated_at=now() WHERE id=$1",
        [
          r.id,
          r.name,
          r.description,
          r.difficulty,
          r.status,
          r.duration,
          distance,
          JSON.stringify(geo),
          r.examCenter ?? null,
        ],
      );
    else
      await db.query(
        "INSERT INTO routes(id,author_id,name,description,difficulty,status,source,duration,distance,geometry,exam_center) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
        [
          r.id,
          p.id,
          r.name,
          r.description,
          r.difficulty,
          r.status,
          r.source,
          r.duration,
          distance,
          JSON.stringify(geo),
          r.examCenter || "",
        ],
      );
    await db.query(
      "UPDATE routes SET mobile_write_key=$2,mobile_write_hash=$3 WHERE id=$1",
      [r.id, writeKey || null, writeHash],
    );
    await db.query("DELETE FROM gps_coordinates WHERE route_id=$1", [r.id]);
    await db.query(
      'INSERT INTO gps_coordinates(route_id,seq,lat,lng,accuracy,recorded_at,segment,recorded_time_known) SELECT $1,j.seq-1,j.lat,j.lng,j.accuracy,to_timestamp(j.time/1000.0),j.segment,COALESCE(j."timeKnown",true) FROM jsonb_to_recordset($2::jsonb) AS j(seq integer,lat double precision,lng double precision,accuracy double precision,time bigint,segment integer,"timeKnown" boolean)',
      [r.id, JSON.stringify(r.fixes.map((f, i) => ({ ...f, seq: i + 1 })))],
    );
    await db.query(
      "UPDATE map_spots SET archived_at=now(),updated_at=now() WHERE source_route_id=$1 AND NOT(id=ANY($2::uuid[])) AND archived_at IS NULL",
      [r.id, r.points.map((p) => p.id)],
    );
    await db.query(
      "DELETE FROM pedagogical_points WHERE route_id=$1 AND NOT(id=ANY($2::uuid[]))",
      [r.id, r.points.map((p) => p.id)],
    );
    for (const point of r.points) {
      const q = point;
      const persistedPoint = await db.query(
        `INSERT INTO pedagogical_points(id,route_id,name,category,fix_index,question,options,answer,explanation,validated_by,latitude,longitude,share_with_students) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13,false)) ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,fix_index=excluded.fix_index,question=excluded.question,options=excluded.options,answer=excluded.answer,explanation=excluded.explanation,validated_by=excluded.validated_by,latitude=excluded.latitude,longitude=excluded.longitude,share_with_students=COALESCE($13,pedagogical_points.share_with_students) RETURNING share_with_students`,
        [
          q.id,
          r.id,
          q.name,
          q.category,
          q.fixIndex,
          q.question,
          JSON.stringify(q.options),
          q.answer ?? 0,
          q.explanation ?? "",
          q.validated ? p.id : null,
          q.lat,
          q.lng,
          q.shareWithStudents ?? null,
        ],
      );
      if (persistedPoint.rows[0].share_with_students) {
        await saveCatalogSpot(db, p, {
          id: q.id,
          authorId: p.id,
          name: q.name,
          category: q.category,
          lat: q.lat,
          lng: q.lng,
          note: q.explanation || "",
          photos: q.photos,
          status: "published",
          shareWithStudents: true,
          sourceRouteId: r.id,
          quiz: q.validated
            ? {
                question: q.question,
                options: q.options,
                answer: q.answer,
                explanation: q.explanation,
              }
            : null,
        });
      } else if (q.shareWithStudents === false) {
        await db.query(
          "UPDATE map_spots SET status='private',share_with_students=false,updated_at=now() WHERE id=$1 AND source_route_id=$2",
          [q.id, r.id],
        );
      }
      await db.query(
        "DELETE FROM photographs WHERE point_id=$1 AND NOT(id=ANY($2::uuid[]))",
        [q.id, q.photos.map((ph) => ph.id)],
      );
      for (const ph of q.photos) {
        const found = await db.query(
          "SELECT point_id FROM photographs WHERE id=$1",
          [ph.id],
        );
        if (found.rows[0] && found.rows[0].point_id !== q.id)
          throw new ApiError(409, "Identifiant de photographie déjà utilisé.");
        await db.query(
          "INSERT INTO photographs(id,point_id,data_url) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET data_url=excluded.data_url",
          [ph.id, q.id, ph.dataUrl],
        );
      }
    }
    await db.query(
      "UPDATE progress SET fix_index=LEAST(fix_index,$2) WHERE route_id=$1",
      [r.id, r.fixes.length - 1],
    );
    return fullRoute(db, p, r.id);
  });
}
export function installRoutes(app: Hono<Env>) {
  app.get("/v1/routes", async (c) => {
    const p = c.get("profile");
    const query = z
      .object({
        difficulty: z.string().optional(),
        category: z.string().optional(),
        favorites: z.enum(["1"]).optional(),
        examCenter: z.string().trim().max(100).optional(),
      })
      .parse(c.req.query());
    const { rows } = await pool.query(
      `SELECT r.*,u.name author_name,EXISTS(SELECT 1 FROM favorites f WHERE f.route_id=r.id AND f.user_id=$1) favorite,COALESCE((SELECT fix_index FROM progress WHERE route_id=r.id AND student_id=$1),0) progress,(SELECT count(*)::int FROM pedagogical_points WHERE route_id=r.id) point_count,COALESCE((SELECT jsonb_agg(DISTINCT category) FROM pedagogical_points WHERE route_id=r.id),'[]'::jsonb) categories FROM routes r JOIN users u ON u.id=r.author_id WHERE ${visibleContent("r", "route")} AND (r.status='published' OR r.author_id=$1 OR $2='admin' OR EXISTS(SELECT 1 FROM assignments a WHERE a.route_id=r.id AND a.student_id=$1)) AND ($3::text IS NULL OR r.difficulty=$3) AND ($4::text IS NULL OR EXISTS(SELECT 1 FROM pedagogical_points pp WHERE pp.route_id=r.id AND pp.category=$4)) AND (NOT $5 OR EXISTS(SELECT 1 FROM favorites f WHERE f.route_id=r.id AND f.user_id=$1)) AND ($6::text IS NULL OR lower(r.exam_center)=lower($6)) ORDER BY r.created_at DESC LIMIT 500`,
      [
        p.id,
        p.role,
        query.difficulty || null,
        query.category || null,
        !!query.favorites,
        query.examCenter || null,
      ],
    );
    return c.json({
      routes: rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        examCenter: r.exam_center || "",
        difficulty: r.difficulty,
        status: r.status,
        source: r.source,
        duration: r.duration,
        distance: r.distance,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        authorId: r.author_id,
        authorName: r.author_name,
        version: r.version,
        favorite: r.favorite,
        progress: r.progress,
        pointCount: r.point_count,
        categories: r.categories,
      })),
    });
  });
  app.get("/v1/routes/:id", async (c) =>
    c.json(
      await fullRoute(
        pool,
        c.get("profile"),
        z.uuid().parse(c.req.param("id")),
      ),
    ),
  );
  app.put("/v1/routes/:id", async (c) => {
    const body = await c.req.json();
    if (body.id !== c.req.param("id"))
      throw new ApiError(400, "Identifiant incohérent.");
    return c.json(
      await saveRoute(c.get("profile"), body, c.req.header("idempotency-key")),
    );
  });
  app.delete("/v1/routes/:id", async (c) => {
    const p = c.get("profile"),
      id = z.uuid().parse(c.req.param("id"));
    await transaction(async (db) => {
      const r = await readable(db, p, id, true);
      owner(p, r.author_id);
      await db.query(
        "UPDATE map_spots SET archived_at=now(),updated_at=now() WHERE source_route_id=$1 AND archived_at IS NULL",
        [id],
      );
      await db.query("DELETE FROM routes WHERE id=$1", [id]);
    });
    return c.json({ ok: true });
  });
  app.post("/v1/routes/:id/duplicate", async (c) => {
    const p = c.get("profile");
    writer(p);
    const r = await fullRoute(pool, p, z.uuid().parse(c.req.param("id")));
    return c.json(
      await saveRoute(p, {
        ...r,
        id: randomUUID(),
        version: 0,
        status: "private",
        name: `${r.name.slice(0, 100)} — copie`,
        points: r.points.map((q) => ({
          ...q,
          shareWithStudents: false,
          id: randomUUID(),
          validated: !!q.explanation && q.answer !== undefined,
          photos: q.photos.map((ph) => ({ ...ph, id: randomUUID() })),
        })),
      }),
      201,
    );
  });
  app.post("/v1/routes/:id/favorite", async (c) => {
    const p = c.get("profile"),
      id = z.uuid().parse(c.req.param("id"));
    await readable(pool, p, id);
    const { active } = z
      .object({ active: z.boolean() })
      .parse(await c.req.json());
    if (active)
      await pool.query(
        "INSERT INTO favorites(route_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [id, p.id],
      );
    else
      await pool.query(
        "DELETE FROM favorites WHERE route_id=$1 AND user_id=$2",
        [id, p.id],
      );
    return c.json({ ok: true });
  });
  app.put("/v1/routes/:id/assignments", async (c) => {
    const p = c.get("profile"),
      id = z.uuid().parse(c.req.param("id"));
    const { students } = z
      .object({ students: z.array(z.string().max(120)).max(100) })
      .parse(await c.req.json());
    await transaction(async (db) => {
      const r = await readable(db, p, id, true);
      owner(p, r.author_id);
      const allowed = await db.query(
        "SELECT u.id FROM users u WHERE u.id=ANY($1::text[]) AND u.role='student' AND ($2='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=u.id AND ts.teacher_id=$3))",
        [students, p.role, p.id],
      );
      if (new Set(students).size !== allowed.rowCount)
        throw new ApiError(
          403,
          "Vous pouvez attribuer un parcours uniquement à vos élèves.",
        );
      await db.query("DELETE FROM assignments WHERE route_id=$1", [id]);
      for (const student of students)
        await db.query(
          "INSERT INTO assignments(route_id,student_id,assigned_by) VALUES($1,$2,$3)",
          [id, student, p.id],
        );
    });
    return c.json({ ok: true });
  });
  app.get("/v1/routes/:id/assignments", async (c) => {
    const p = c.get("profile"),
      id = z.uuid().parse(c.req.param("id"));
    const r = await readable(pool, p, id);
    owner(p, r.author_id);
    const { rows } = await pool.query(
      "SELECT student_id FROM assignments WHERE route_id=$1",
      [id],
    );
    return c.json({ students: rows.map((r) => r.student_id) });
  });
  app.post("/v1/routes/:id/progress", async (c) => {
    const p = c.get("profile"),
      id = z.uuid().parse(c.req.param("id"));
    const { fixIndex } = z
      .object({ fixIndex: z.number().int().min(0) })
      .parse(await c.req.json());
    await readable(pool, p, id);
    const { rows } = await pool.query(
      "SELECT count(*)::int count FROM gps_coordinates WHERE route_id=$1",
      [id],
    );
    if (fixIndex >= rows[0].count)
      throw new ApiError(400, "Progression hors du parcours.");
    await pool.query(
      "INSERT INTO progress(route_id,student_id,fix_index) VALUES($1,$2,$3) ON CONFLICT(route_id,student_id) DO UPDATE SET fix_index=GREATEST(progress.fix_index,excluded.fix_index),updated_at=now()",
      [id, p.id, fixIndex],
    );
    return c.json({ ok: true });
  });
  app.post("/v1/routes/:id/quiz", async (c) => {
    const p = c.get("profile"),
      routeId = z.uuid().parse(c.req.param("id"));
    const { pointId, answer, attemptId } = z
      .object({
        pointId: z.uuid(),
        answer: z.number().int().min(0).max(5),
        attemptId: z.uuid(),
      })
      .parse(await c.req.json());
    await readable(pool, p, routeId);
    const { rows } = await pool.query(
      "SELECT p.* FROM pedagogical_points p WHERE p.id=$1 AND p.route_id=$2 AND p.validated_by IS NOT NULL AND NOT EXISTS(SELECT 1 FROM map_spots s WHERE s.id=p.id AND s.archived_at IS NOT NULL)",
      [pointId, routeId],
    );
    const q = rows[0];
    if (!q || answer >= q.options.length)
      throw new ApiError(400, "Question ou réponse invalide.");
    const correct = answer === q.answer;
    const result = await pool.query(
      "INSERT INTO quiz_attempts(id,student_id,point_id,answer,correct,question_snapshot,options_snapshot,correct_answer_snapshot,explanation_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING RETURNING id",
      [
        attemptId,
        p.id,
        pointId,
        answer,
        correct,
        q.question,
        JSON.stringify(q.options),
        q.answer,
        q.explanation,
      ],
    );
    if (!result.rowCount) {
      const prior = await pool.query(
        "SELECT * FROM quiz_attempts WHERE id=$1 AND student_id=$2 AND point_id=$3 AND answer=$4",
        [attemptId, p.id, pointId, answer],
      );
      if (!prior.rowCount)
        throw new ApiError(409, "Identifiant de réponse déjà utilisé.");
      if (
        prior.rows[0].correct_answer_snapshot !== null &&
        prior.rows[0].explanation_snapshot !== null
      )
        await recordSharedRouteAttempt(
          p,
          {
            ...q,
            question: prior.rows[0].question_snapshot,
            options: prior.rows[0].options_snapshot,
            answer: prior.rows[0].correct_answer_snapshot,
            explanation: prior.rows[0].explanation_snapshot,
          },
          attemptId,
          answer,
        );
      return c.json({
        correct: prior.rows[0].correct,
        answer: prior.rows[0].correct_answer_snapshot ?? q.answer,
        explanation: prior.rows[0].explanation_snapshot ?? q.explanation,
      });
    }
    await recordSharedRouteAttempt(p, q, attemptId, answer);
    return c.json({ correct, answer: q.answer, explanation: q.explanation });
  });
  installLearning(app);
}
