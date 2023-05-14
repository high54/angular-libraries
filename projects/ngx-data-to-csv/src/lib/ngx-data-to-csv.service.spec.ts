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

  it('should be able to transform data to CSV', () => {
    const csv = service.toCsv([{
      name: 'test', age: 20, address: {
        street: '456 Maple St',
        city: 'Los Angeles'
      }, user: {
        name: 'jojo',
        todos: [
          { id: 1, title: 'oups' },
          { id: 2, title: 'a faire' }
        ]
      }
    }], 'My Report', { useByteOrderMark: false, noDownload: false, useObjHeader: true } as Config);

  });
});
