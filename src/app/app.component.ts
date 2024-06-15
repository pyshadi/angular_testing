import { Component, OnInit, OnDestroy  } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from './data.service';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true, 
  imports: [HttpClientModule] 
})

export class AppComponent implements OnInit, OnDestroy {
  parameters: string[] = [];
  values: number[] = [];
  private dataSubscription: Subscription | undefined;
  private intervalSubscription: Subscription | undefined;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.fetchData();

    // Fetch data every 5 seconds
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.fetchData();
    });
  }

  fetchData() {
    this.dataSubscription = this.dataService.getData().subscribe(data => {
      console.log('Data received:', data);  // Log the received data
      this.parameters = data.parameters;
      this.values = data.values;
      this.updateDOM();
    });
  }

  updateDOM() {
    console.log('Updating DOM');  // Log when the DOM update is happening
    const container = document.getElementById('data-container');
    if (container) {
      container.innerHTML = '<h1>Data from JSON</h1>';
      for (let i = 0; i < this.parameters.length; i++) {
        const param = document.createElement('div');
        param.innerText = `${this.parameters[i]}: ${this.values[i]}`;
        container.appendChild(param);
      }
    }
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}