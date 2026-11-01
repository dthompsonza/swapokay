import { Routes } from '@angular/router';
import { CollectionPage } from './pages/collection';
import { HomePage } from './pages/home';
import { KindPage } from './pages/kind';
import { NewCollectionPage } from './pages/new-collection';
import { AboutPage } from './pages/about';
import { SponsorsPage } from './pages/sponsors';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'about', component: AboutPage },
  { path: 'sponsors', component: SponsorsPage },
  { path: 'kind/:code', component: KindPage },
  { path: 'kind/:code/new', component: NewCollectionPage },
  { path: 'kind/:code/c/:name', component: CollectionPage },
  { path: '**', redirectTo: '' },
];
