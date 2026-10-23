// Generation guards make Stop immediate, even while an OS permission prompt is pending.
// A subsequent start waits for the cancelled activation to release native resources.
export class RecordingController {
  private generation = 0;
  private close: (() => void | Promise<void>) | undefined;
  private activating: Promise<void> | undefined;
  async start<T>(
    prepare: () => Promise<T>,
    activate: (
      value: T,
      isCurrent: () => boolean,
    ) => Promise<() => void | Promise<void>>,
    cancelPrepared: (value: T) => Promise<void>,
  ) {
    const generation = ++this.generation;
    const current = () => generation === this.generation;
    const previous = this.activating;
    const run = (async () => {
      await previous?.catch(() => {});
      if (!current()) return;
      const value = await prepare();
      if (!current()) {
        await cancelPrepared(value);
        return;
      }
      const close = await activate(value, current);
      if (!current()) {
        await close();
        return;
      }
      this.close = close;
    })();
    this.activating = run;
    try {
      await run;
    } finally {
      if (this.activating === run) this.activating = undefined;
    }
  }
  async stop(beforeClose: () => Promise<void>) {
    ++this.generation;
    const close = this.close;
    this.close = undefined;
    await beforeClose();
    await close?.();
  }
}
