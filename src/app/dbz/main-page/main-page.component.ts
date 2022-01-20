import { Component } from '@angular/core';
import { Proceso } from '../interfaces/dbz.interface';

import { DbzService } from '../services/dbz.service';




@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html'
})
export class MainPageComponent {

  nuevo: Proceso = {
    id_consulta: 0,
    campos_update:'',
    indice: '',
    table_source:''
  }
  constructor() {}

}
