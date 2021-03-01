import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from 'src/app/models/user_profile';
import { AlertService } from '../../core/alert.service';
import { HttpService } from '../../core/http.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private httpService: HttpService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.checkLogin();
  }

  private profileSubject = new BehaviorSubject(new UserProfile());
  profile = this.profileSubject.asObservable();

  isLogin = false;
  // store the URL so we can redirect after logging in
  redirectUrl: string;

  checkLogin(): void {
    const token = localStorage.getItem('token');

    if (!token || token == null || token === '') {
      this.isLogin = false;
    } else {
      this.isLogin = true;
    }
  }

  login(data): void {
    const url = 'auth/login';
    this.httpService.post(url, data).subscribe((res) => {
      console.warn(res);
      if (res && res.success) { // Thành công
        this.isLogin = true;
        console.warn(res.data.acess);
        console.warn(res.data.refresh);
        localStorage.setItem('token', res.data.access);
        localStorage.setItem('refreshToken', res.data.refresh);
        this.router.navigateByUrl('/dashboard');
      } else {
        this.alertService.errorAlert(res);
      }
    });
  }

  logout(): void {
    this.isLogin = false;
    localStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }

  getProfile(): any {
    const url = 'auth/profile';
    this.httpService.get(url).subscribe((res) => {
      if (res && res.success) {
        this.profileSubject.next({ ...res.data });
      } else {
        this.alertService.errorAlert(res);
        return null;
      }
    });
  }

  updateProfile(data: FormData): any {
    const url = 'auth/profile';
    this.httpService.put(url, data).subscribe((res) => {
      if (res && res.success) {
        this.profileSubject.next({ ...res.data });
        this.alertService.successAlert(
          'Cập nhật thông tin cá nhân thành công.'
        );
      } else {
        this.alertService.errorAlert(res);
      }
    });
  }

  changePassword(data: object): any {
    const url = 'auth/change-password';
    this.httpService.put(url, data).subscribe((res) => {
      if (res && res.success) {
        this.profileSubject.next({ ...res.data });
        this.alertService.successAlert('Đổi mật khẩu thành công');
      } else {
        this.alertService.errorAlert(res);
      }
    });
  }
}
