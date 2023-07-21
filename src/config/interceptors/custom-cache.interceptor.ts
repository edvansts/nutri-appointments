import { CacheInterceptor, ExecutionContext } from '@nestjs/common';

export class CustomCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest();

    const ignoreCaching: boolean = this.reflector.get(
      'ignoreCaching',
      context.getHandler(),
    );

    return !ignoreCaching && this.allowedMethods.includes(request.method);
  }
}
