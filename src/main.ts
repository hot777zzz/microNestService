import { bootstrap } from './bootstrap';

bootstrap().catch((err) => {
  console.error(
    '应用启动失败:',
    err instanceof Error ? err.message : String(err),
  );
});
