import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Proceso } from '../interfaces/dbz.interface';

import { DbzService } from '../services/dbz.service';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html'
})
export class AgregarComponent {

  @Input() nuevo: Proceso = {
    id_consulta: 0,
    table_source:'',
    indice: '',
    campos_update: '',
  }

  
  constructor( private dbzService: DbzService ) {}

  // @Output() onNuevoPersonaje: EventEmitter<Personaje> = new EventEmitter();
  fakeValidateUserData() {
    return ({
      id_consulta: this.nuevo.id_consulta,
      table_source: this.nuevo.table_source.trim(),
      indice: this.nuevo.indice.trim(),
      update: this.nuevo.campos_update.trim(),
    });
  }
  generar() {
      let res = ''
      
      res = this.nuevo.id_consulta + ',' + this.nuevo.table_source + ',' + this.nuevo.indice + ',' + this.nuevo.campos_update;
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      window.open(url); 
  }
  agregar() {
    if ( this.nuevo.table_source.trim().length === 0 ) { return; }
    
    // this.onNuevoPersonaje.emit( this.nuevo );
    this.dbzService.agregarConsulta( this.nuevo );
    this.generar();

    this.nuevo = {
      id_consulta:0,
      table_source:'',
      campos_update:'',
      indice:''
    }

  }
}
