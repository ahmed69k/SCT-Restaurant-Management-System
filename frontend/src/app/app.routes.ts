import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MenuComponent } from './components/menu/menu.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
import { TablesComponent } from './components/tables/tables.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { FeedbacksComponent } from './components/feedbacks/feedbacks.component';
import { AuthGuard } from './guards/auth.guard';
import { UsersComponent } from './components/users/users.component';

export const routes: Routes = [
    {path:"", component: HomeComponent},
    {path:"home", component: HomeComponent},
    {path:"register", component: RegisterComponent},
    {path: 'login', component: LoginComponent},
    {path: 'profile', component: ProfileComponent },
    {path: 'menu', component: MenuComponent},
    {path:'reservations', component:ReservationsComponent},
    {path: "tables",component:TablesComponent},
    {path: 'not-found',component:NotfoundComponent},
    {path: 'feedbacks',component:FeedbacksComponent, canActivate: [AuthGuard],data:{roles: ['Admin',"Staff"]}},
    {path:'users',component:UsersComponent, canActivate: [AuthGuard], data:{roles: ['Admin']}},
    {path:"**", component: NotfoundComponent},
    
];
