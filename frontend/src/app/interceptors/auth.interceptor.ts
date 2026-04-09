import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = sessionStorage.getItem('token'); // ✅ FIXED


  // ✅ ADD THIS LINE HERE
  console.log('Interceptor token:', token);

  if (token && token !== 'null' && token !== 'undefined') {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};