// BrandGuard AI Entrypoint: Supports Express with graceful zero-dependency fallback
async function bootstrap() {
  try {
    // Attempt to load express implementation
    await import('./serverExpress.js');
  } catch (err) {
    console.log('[BrandGuard AI] Bootstrapping built-in zero-dependency HTTP Engine...');
    await import('./serverNative.js');
  }
}

bootstrap();
