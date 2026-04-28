import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule ,NgChartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
  
})

export class AdminDashboardComponent implements OnInit {
@ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  totalProjects = 0;
  activeProjects = 0;

  totalTasks = 0;
  completedTasks = 0;
  projectTotal = 0;

  projects: any[] = [];
  reminders: any[] = [];
  showNotifications = false;
  delayedTasks: any[] = [];
  delayRanking: any[] = [];


  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

 ngOnInit() {
  this.loadProjects();
  this.loadTasks();
  this.loadReminders();
  this.loadDelayedTasks();
  this.loadDelayRanking();
  this.loadTaskTrend();

  setInterval(() => {
    this.loadTasks();          // ✅ ADD THIS
    this.loadDelayedTasks();
    this.loadDelayRanking();
    this.loadTaskTrend();
  }, 30000);
}




  loadProjects() {
  this.projectService.getAll().subscribe((res: any) => {

    this.projects = res?.data?.data || [];

    this.totalProjects = this.projects.length;

    this.activeProjects = this.projects.filter(
      (p: any) => p.status?.toUpperCase() === 'ACTIVE'
    ).length;

    // ✅ ADD THIS LINE
    this.loadProjectStatusChartFromProjects();

  });
}

  loadTasks() {
  this.taskService.getSummary().subscribe((res: any) => {

    console.log('TASK SUMMARY RESPONSE:', res);

    const data = res?.data || {};

    this.totalTasks = data.total || 0;
    this.completedTasks = data.completed || 0;

  });
}
loadReminders() {
  this.projectService.getTodayReminders().subscribe((res: any) => {
    console.log('REMINDERS:', res);

    this.reminders = res?.data || [];
  });
}
loadDelayedTasks() {
  this.taskService.getDelayedSchedules().subscribe((res: any) => {

    const tasks = res?.data || [];

    // ✅ SIMPLE & CORRECT
    this.delayedTasks = tasks;

  });
}
loadDelayRanking() {
  this.taskService.getDelayRanking().subscribe((res: any) => {
    this.delayRanking = res?.data || [];
  });
}
getDelayDays(endDate: string | Date): number {
  const today = new Date();
  const end = new Date(endDate);

  return Math.floor(
    (today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
  );
}

projectChartData: ChartConfiguration<'doughnut'>['data'] = {
  labels: ['Completed', 'Active', 'Delayed'],
  datasets: [
  {
    data: [12, 8, 3],
    backgroundColor: [
      '#00c853',   // neon green
      '#2962ff',   // deep blue
      '#ff1744'    // vibrant red
    ],
    hoverBackgroundColor: [
      '#00e676',
      '#448aff',
      '#ff5252'
    ],
    borderWidth: 0
  }
]
};

projectChartOptions: ChartConfiguration<'doughnut'>['options'] = {
  responsive: true,
  cutout: '70%',
  plugins: {
    legend: {
      display: false   // 🔥 THIS REMOVES DUPLICATE LEGEND
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.raw}`;
        }
      }
    }
  }
};
taskTrendData: ChartConfiguration<'line'>['data'] = {
  labels: [],
  datasets: [
    {
      data: [],
      label: 'Tasks Created',
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.2)',
      tension: 0.5,
      fill: true,
      pointRadius: 5
    }
  ]
};
taskTrendOptions: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,

  animation: {
    duration: 1200,
    easing: 'easeInOutQuart'
  },

  plugins: {
    legend: {
      display: false,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          weight: 500
        }
      }
    },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 8
    }
  },

  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#6b7280'
      }
    },

    y: {
      beginAtZero: true,

      ticks: {
        stepSize: 1,
        color: '#6b7280'
      },

      grid: {
        color: '#e5e7eb'
      }
    }
  }
};
loadTaskTrend() {
  this.taskService.getTaskTrend().subscribe((res: any) => {

    const apiData = res?.data || [];
    const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    const createdMap: any = {};

    apiData.forEach((item: any) => {
      createdMap[item.day] = Number(item.created || item.count || 0);
    });

    const createdData = weekDays.map(day => createdMap[day] || 0);

    this.taskTrendData = {
      labels: weekDays,
      datasets: [
        {
          ...this.taskTrendData.datasets[0],
          data: createdData
        }
      ]
    };

  });
}
getWeeklyIncrease(): string {
  const data = this.taskTrendData.datasets[0].data as number[];

  const first = data[0] || 0;
  const last = data[data.length - 1] || 0;

  if (first === 0 && last === 0) return 'No activity this week';

  if (first === 0) return 'New activity started this week';

  const percent = ((last - first) / first) * 100;

  return `${percent > 0 ? '↑' : '↓'} ${Math.abs(percent).toFixed(0)}% this week`;
}

loadProjectStatusChartFromProjects() {

  let completed = 0;
  let active = 0;
  let delayed = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  this.projects.forEach((project: any) => {

    const endDate = new Date(project.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (project.status === 'COMPLETED') {
      completed++;
    } 
    else if (project.status === 'ACTIVE') {

      // 🔥 CHECK DELAY CONDITION
      if (endDate < today) {
        delayed++;
      } else {
        active++;
      }

    }

  });

  // ✅ TOTAL
  this.projectTotal = completed + active + delayed;

  // ✅ UPDATE CHART
  this.projectChartData = {
    labels: ['Completed', 'Active', 'Delayed'],
    datasets: [
      {
        data: [completed, active, delayed],
        backgroundColor: ['#00c853', '#2962ff', '#ff1744'],
        hoverBackgroundColor: ['#00e676', '#448aff', '#ff5252'],
        borderWidth: 0
      }
    ]
  };

  this.chart?.update(); // 🔥 refresh chart
}

}
