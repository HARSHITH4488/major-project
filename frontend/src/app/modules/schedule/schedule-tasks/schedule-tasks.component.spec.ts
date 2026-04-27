import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTasksComponent } from './schedule-tasks.component';

describe('ScheduleTasksComponent', () => {
  let component: ScheduleTasksComponent;
  let fixture: ComponentFixture<ScheduleTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
