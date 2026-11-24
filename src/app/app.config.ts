import { registerLocaleData } from '@angular/common';
import id from '@angular/common/locales/id';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

registerLocaleData(id);

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
