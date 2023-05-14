import { TestBed } from '@angular/core/testing';
import { Config } from './model';

import { NgxDataToCsvService } from './ngx-data-to-csv.service';

describe('NgxDataToCsvService', () => {
  let service: NgxDataToCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxDataToCsvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
