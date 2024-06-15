import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data from JSON file', () => {
    const dummyData = {
      "parameters": ["param1", "param2", "param3"],
      "values": [1000, 200, 8000]
    };

    service.getData().subscribe(data => {
      expect(data.parameters.length).toBe(3);
      expect(data).toEqual(dummyData);
    });

    // Log the requests to diagnose
    const requests = httpMock.match((req) => {
      console.log('Request made to URL:', req.url);
      return req.url === 'assets/data.json';
    });

    expect(requests.length).toBe(1);
    requests[0].flush(dummyData);
  });
});
