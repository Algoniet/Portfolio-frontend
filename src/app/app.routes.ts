import { Routes } from '@angular/router';
import { Home } from './features/home/home/home';
import { About } from './features/about/about/about';
import { ProjectDetail } from './features/project-detail/project-detail';

export const routes: Routes = [
  { path: '', component: Home, title: 'Mi Portfolio | Inicio' },
  { path: 'about', component: About, title: 'Mi Portfolio | Sobre Mí' },
  { path: 'projects', component: ProjectDetail, title: 'Mi Portfolio | Proyectos' },
  { path: 'projects/:id', component: ProjectDetail, title: 'Mi Portfolio | Detalle de Proyecto' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
