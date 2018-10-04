import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { UserApi } from '../api/user.api';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { cold, hot, getTestScheduler } from 'jasmine-marbles';
import { RouterTestingModule } from '@angular/router/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let userApiSpy: jasmine.SpyObj<UserApi>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [FormsModule, HttpClientModule, RouterTestingModule],
      providers: [
        {
          provide: UserApi,
          useValue: jasmine.createSpyObj('userApi', [
            'getAllUsers',
            'searchUser'
          ])
        }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    userApiSpy = TestBed.get(UserApi);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all users', () => {
    const expectedUsers = [
      {
        title: 'mr',
        first: 'thomas',
        last: 'lopez',
        email: 'thomas.lopez@example.com',
        id: 2
      }
    ];
    const users$ = cold('--a|', { a: expectedUsers });
    userApiSpy.getAllUsers.and.returnValue(users$);
    fixture.detectChanges();
    expect(component.users$).toEqual(users$, 'no users');
  });

  it('can search user by name', () => {
    const scheduler = getTestScheduler();
    const expectedUsers = [
      {
        title: 'mr',
        first: 'thomas',
        last: 'lopez',
        email: 'thomas.lopez@example.com',
        id: 2
      }
    ];
    component.debounce = 600;
    component.scheduler = scheduler;

    fixture.detectChanges();

    const expectedUsers$ = cold('-- 599ms a|', { a: expectedUsers });
    userApiSpy.searchUser.and.returnValue(expectedUsers$);
    component.searchTermObservable$ = cold('--b|', {
      b: 'red'
    });

    component.ngOnInit();

    scheduler.flush();

    expect(component.users$).toBeObservable(expectedUsers$);
  });
});
