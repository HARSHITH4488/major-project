import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractorService } from '../contractor/contractor.service';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-contractor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `

  <div class="page">

    <!-- 🔥 PREMIUM HEADER -->
    <div class="header">
      <div>
        <h2>Welcome back, {{ contractorName || 'Contractor' }}</h2>
        <p>Here’s your project overview for today.</p>
      </div>
    </div>

    <h1 class="title">Contractor Dashboard</h1>

    <!-- 🔥 CARDS -->
    <div class="cards">

      <div class="card">
        <h3>Pending Tasks</h3>
        <p>{{pending}}</p>
      </div>

      <div class="card">
        <h3>In Progress</h3>
        <p>{{inProgress}}</p>
      </div>

      <div class="card">
        <h3>Completed</h3>
        <p>{{completed}}</p>
      </div>

      <div class="card overdue">
        <h3>Overdue</h3>
        <p>{{overdue}}</p>
      </div>

    </div>

    <!-- 🔥 ACTION BUTTONS -->
    <div class="actions">

      <button routerLink="/contractor/tasks">
        View My Tasks
      </button>

      <button routerLink="/contractor/timeline">
        View Timeline
      </button>

      <button routerLink="/contractor/updates">
        Updates
      </button>

    </div>

  </div>
  `,
  styles: [`

  /* 🔥 PAGE BACKGROUND */
  .page{
    padding:30px;
    background: linear-gradient(135deg, #eef2f7, #f8fafc);
    min-height:100vh;
    font-family: 'Segoe UI', sans-serif;
  }

  /* 🔥 HEADER */
  .header{
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
    color:white;
    padding:20px 25px;
    border-radius:12px;
    margin-bottom:25px;
    box-shadow:0 8px 20px rgba(0,0,0,0.1);
  }

  .header h2{
    margin:0;
    font-size:22px;
    font-weight:600;
  }

  .header p{
    margin-top:5px;
    font-size:14px;
    opacity:0.9;
  }

  /* 🔥 TITLE */
  .title{
    margin-bottom:20px;
    font-size:26px;
    font-weight:600;
    color:#1f2937;
  }

  /* 🔥 CARDS */
  .cards{
    display:flex;
    gap:20px;
    flex-wrap:wrap;
  }

  .card{
    flex:1;
    min-width:200px;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(10px);
    padding:25px;
    border-radius:14px;
    text-align:center;
    box-shadow:0 6px 15px rgba(0,0,0,0.08);
    transition:all 0.3s ease;
  }

  .card:hover{
    transform: translateY(-5px);
    box-shadow:0 10px 25px rgba(0,0,0,0.12);
  }

  .card h3{
    margin-bottom:10px;
    color:#374151;
    font-size:16px;
  }

  .card p{
    font-size:32px;
    font-weight:bold;
    color:#111827;
  }

  /* 🔥 OVERDUE CARD */
  .overdue{
    border-left:6px solid #ef4444;
  }

  /* 🔥 BUTTONS */
  .actions{
    margin-top:35px;
    display:flex;
    gap:15px;
    flex-wrap:wrap;
  }

  button{
    padding:12px 22px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color:white;
    border:none;
    border-radius:8px;
    cursor:pointer;
    font-weight:500;
    transition:all 0.3s ease;
  }

  button:hover{
    transform: translateY(-2px);
    box-shadow:0 6px 15px rgba(37,99,235,0.4);
  }

  `]
})
export class ContractorDashboardComponent implements OnInit {

  pending = 0;
  inProgress = 0;
  completed = 0;
  overdue = 0;

  contractorName: string = '';

  constructor(
    private contractorService: ContractorService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadSummary();
    this.loadUserName();
  }

  loadSummary(){
    const userId = Number(sessionStorage.getItem('userId'));

    this.contractorService
      .getContractorSummary(userId)
      .subscribe((res:any)=>{
        this.pending = res.data.pending || 0;
        this.inProgress = res.data.inProgress || 0;
        this.completed = res.data.completed || 0;
        this.overdue = res.data.overdue || 0;
      });
  }

 loadUserName() {
  const user = sessionStorage.getItem('user');

  if (!user) {
    this.contractorName = 'Contractor';
    return;
  }

  const parsedUser = JSON.parse(user);

  this.contractorName =
    parsedUser.name
      ?.toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Contractor';
}
}