import { TestBed } from '@angular/core/testing';

import { BooleanValueService } from './boolean-value.service';

describe('BooleanValueService', () => {
  let service: BooleanValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BooleanValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
