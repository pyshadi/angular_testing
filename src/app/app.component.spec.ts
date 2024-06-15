import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class MockDataService {
  getData() {
    return of({
      "parameters": ["param1", "param2", "param3"],
      "values": [1000, 200, 8000]
    });
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppComponent],
      providers: [{ provide: DataService, useClass: MockDataService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    spyOn(dataService, 'getData').and.callThrough();

    component.ngOnInit();

    expect(dataService.getData).toHaveBeenCalled();
    expect(component.parameters.length).toBe(3);
    expect(component.values.length).toBe(3);
  });

  it('should update the DOM with data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Manually set the parameters and values for the test
    component.parameters = ["param1", "param2", "param3"];
    component.values = [1000, 200, 8000];
    
    component.updateDOM();
    
    fixture.detectChanges();
    
    expect(compiled.querySelector('.data-container')?.textContent).toContain('param1: 1000');
    expect(compiled.querySelector('.data-container')?.textContent).toContain('param2: 200');
    expect(compiled.querySelector('.data-container')?.textContent).toContain('param3: 8000');
  });
});
