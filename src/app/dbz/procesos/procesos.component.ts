import { Component, Input } from '@angular/core';

import { DbzService } from '../services/dbz.service';

@Component({
  selector: 'app-personajes',
  templateUrl: './procesos.component.html'
})
export class ProcesosComponent {

  // @Input() personajes: Personaje[] = [];
  get procesos() {
    return this.dbzService.procesos;
  }

  constructor( private dbzService: DbzService ) {}

}
