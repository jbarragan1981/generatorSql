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

  public newLine = 'CRLF';
  //public newLine = '/n';

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
      let res = this.generarCSV(this.nuevo.id_consulta.toString(), this.nuevo.table_source, this.nuevo.indice, this.nuevo.campos_update);
      
      const blob = new Blob([res], { type: 'text/csv;charset=utf-8'});
      const url = window.URL.createObjectURL(blob);
      window.open(url); 
  }
  agregar() {
    if ( this.nuevo.table_source.trim().length === 0 ) { return; }
    
    // this.onNuevoPersonaje.emit( this.nuevo );
    //this.dbzService.agregarConsulta( this.nuevo );
    this.generar();

    /*this.nuevo = {
      id_consulta:0,
      table_source:'',
      campos_update:'',
      indice:''
    }*/

  }

  generarCSV(idConsulta: string, tableSource:string, indice:string, camposUpdate:string)
  {

      let L_cadena1 = "";

      L_cadena1 = "ID_Consulta:" + this.analizar_ID_Consulta(idConsulta) + this.saltoLinea(1) + "DB_Source:" + this.analizar_DB_Source(1) + this.saltoLinea(2) + "Schema_Source:" + this.analizar_Schema_Source() + this.newLine + "Table_Source:" + this.analizar_Table_Source(tableSource) + this.newLine + "Query_Source:" + this.analizar_Query_Source(tableSource, 1) + this.newLine;
      L_cadena1 = L_cadena1 + "DB_LZ:" + this.analizar_DB_LZ() + this.newLine + "Schema_LZ:" + this.analizar_Schema_LZ() + this.newLine + "" + "Schema_LZ_tmp:" + this.analizar_Schema_LZ_tmp() + this.newLine + "Table_Destination:" + this.analizar_Table_Destination(tableSource) + this.newLine + "indice:" + this.analizar_Indice(indice) + this.newLine;
      L_cadena1 = L_cadena1 + "Query_Source_LZ:" + this.analizar_Query_Source_LZ(tableSource, indice, 1) + this.newLine + "Query_Clean_LZ:" + this.analizar_Query_Clean_LZ(tableSource) + this.newLine +  "Query_Inc_LZ:" + this.analizar_Query_Inc_LZ(tableSource, indice, camposUpdate);

        return L_cadena1;
  }

  saltoLinea(num: number)
  {
      let cadena = "";
      
      for (var k = 0; k < num; k++)
      {
          cadena = cadena + this.newLine;
      }
      return cadena;
  }

  analizar_ID_Consulta(idConsulta: string)
  {
      return idConsulta;
  }

  analizar_DB_Source(opt: number)
  {
      var cadena = "";
      if (opt == 1)  {
          cadena = "IvyCPG_BimboMexico_National";
      } else
      {
          cadena = "IvyCPG_BimboMexico_Canary";
      }
      return cadena;
  }


  analizar_Schema_Source()
  {
      return "dbo";
  }

  analizar_Table_Source(tableSource: string)
  {
      return tableSource;
  }

  analizar_Query_Source(tableSource: string, opt: number)
  {
      var cadena = "";

      cadena = "select * from " + this.analizar_DB_Source(opt) + "." + this.analizar_Schema_Source() + "." + tableSource  + " where convert(date,Created_Date) between '<D_FECHA>' and '<A_FECHA>'";
      return cadena;
  }

  

  analizar_DB_LZ()
  {
      return "SQLLANDINGQARTMBM";
  }

  analizar_Schema_LZ()
  {
      return "GRO_BM_RTM";
  }

  analizar_Schema_LZ_tmp()
  {
      return "GRO_BM_RTM_TMP";
  }

  analizar_Table_Destination(tableSource: string)
  {
      return tableSource;
  }


  analizar_Indice(indice: string)
  {
      var cadena = "";
      cadena = "convert(nvarchar," + indice + ")+'.'+Source_IVY";
      return cadena;
  }

  analizar_Query_Source_LZ(tableSource: string,indice: string, opt: number)
  {
      /*Revisar campos Modified_Date*/
      var cadena = "";
      var cadena_source = "";
      if (opt==1)
      {
          cadena_source = "National";
      } else
      {
          cadena_source = "Canary";
      }
      cadena = "select *,convert(nvarchar," + indice + ")+'.'+Source_IVY as Indice from " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " where convert(date,Created_Date) between '<D_FECHA>' and '<A_FECHA>' ";
      cadena = cadena + " and Modified_Date is null "; //esta y la de abajo no iría 
      cadena = cadena + " and Source_IVY = '" + cadena_source + "' union all select *,convert(nvarchar," + indice + ")+'.'+Source_IVY as Indice from " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " where convert(date,Modified_Date) between '<D_FECHA>' and '<A_FECHA>' and Modified_Date is not null and Source_IVY = '" + cadena_source + "'";

      return cadena;
  }

  analizar_Query_Clean_LZ(tableSource: string)
  {

      var cadena = "";
      cadena = "if ((select CONVERT(INT,count('" + this.analizar_DB_LZ() + ".'+b.name+'.'+a.name)) from " + this.analizar_DB_LZ() + ".sys.objects a INNER JOIN " + this.analizar_DB_LZ() + ".sys.schemas b ON a.schema_id = b.schema_id where [type] = 'U' and ('" + this.analizar_DB_LZ() + ".'+b.name+'.'+a.name)='" + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ_tmp() + "." + tableSource + "' ) > 0) BEGIN TRUNCATE TABLE " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ_tmp() + "." + tableSource + " end";

      return cadena;
  }


  analizar_Query_Inc_LZ( tableSource:string, indice:string, camposUpdate:string)
  {
      var cadena = "";
      var cadena2 = "";
      
      var flag = true;

      var list = [];
      var campo = "";
      list = camposUpdate.split(',');

      cadena = "update b set ";
      list.forEach(function(campo) {
        if (flag == false)
          {
              cadena = cadena + ",";
          }
          flag = false;
          cadena = cadena + "b." + campo.trim() + " = a." + campo.trim();
      });

      cadena = cadena + " from " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ_tmp() + "." + tableSource + " a ";
      cadena = cadena + " LEFT JOIN " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " b ";
      cadena = cadena + " ON a." + indice + " = b." + indice + " ";
      cadena = cadena + " and a.Source_IVY = b.Source_IVY";
      cadena = cadena + " where b." + indice + " is not null";

      cadena2 = "insert into " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " ";
      cadena2 = cadena2 + "select a.* from " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ_tmp() + "." + tableSource + " a ";
      cadena2 = cadena2 + " LEFT JOIN " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " b ";
      cadena2 = cadena2 + " ON a." + indice + " = b." + indice + " ";
      cadena2 = cadena2 + " and a.Source_IVY = b.Source_IVY ";
      cadena2 = cadena2 + " where b." + indice + " is null";


      return cadena + this.newLine + cadena2;
      
  }

  analizar_Query_Prog_LZ(tableSource: string, indice: string , opt: number)
  {
      /*Revisar campos Modified_Date*/
      var cadena = "";
      var cadena_source = "";
      if (opt == 1)
      {
          cadena_source = "National";
      }
      else
      {
          cadena_source = "Canary";
      }

      cadena = "select convert(date,isnull(MAX(maxDate),'2019-01-01')) as maxDate, isnull(max(IDMax),0) as IDMax from (SELECT max(Created_Date) as maxDate, max(" + indice + ") as IDMax from " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " where Source_IVY = '" + cadena_source + "' ";
      cadena = cadena + " union all "; //esta y la de abajo
      cadena = cadena + "SELECT max(Modified_Date) as maxDate, max(" + indice + ") as IDMax from " + this.analizar_DB_LZ() + "." + this.analizar_Schema_LZ() + "." + tableSource + " where Source_IVY = '" + cadena_source + "' ) as a";

      return cadena;
  }


  analizar_DB_CZ()
  {
      return "SQLCURATEDQARTMBM";
  }

  analizar_Schema_CZ()
  {
      return "GRO_BM_RTM";
  }

  analizar_Schema_CZ_tmp()
  {
      return "GRO_BM_RTM_TMP";
  }


  analizar_Query_Clean_CZ(tableSource: string)
  {

      var cadena = "";
      cadena = "if ((select CONVERT(INT,count('" + this.analizar_DB_CZ() + ".'+b.name+'.'+a.name)) from " + this.analizar_DB_CZ() + ".sys.objects a INNER JOIN " + this.analizar_DB_CZ() + ".sys.schemas b ON a.schema_id = b.schema_id where [type] = 'U' and ('" + this.analizar_DB_CZ() + ".'+b.name+'.'+a.name)='" + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ_tmp() + "." + tableSource + "' ) > 0) BEGIN TRUNCATE TABLE " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ_tmp() + "." + tableSource + " end";
      
      return cadena;
  }

  analizar_Query_Inc_CZ(tableSource: string, indice: string, camposUpdate: string)
  {
      var cadena = "";
      var cadena2 = "";

      var flag = true;
      var list = [];
      var campo = "";
      list = camposUpdate.split(',');

      cadena = "update b set ";
      list.forEach(function(campo) {
        if (flag == false)
          {
              cadena = cadena + ",";
          }
          flag = false;
          cadena = cadena + "b." + campo.trim() + " = a." + campo.trim();
      });
      
      cadena = cadena + " from " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ_tmp() + "." + tableSource + " a ";
      cadena = cadena + " LEFT JOIN " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ() + "." + tableSource + " b ";
      cadena = cadena + " ON a." + indice + " = b." + indice + " ";
      cadena = cadena + " and a.Source_IVY = b.Source_IVY";
      cadena = cadena + " where b." + indice + " is not null";

      cadena2 = "insert into " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ() + "." + tableSource + " ";
      cadena2 = cadena2 + "select a.* from " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ_tmp() + "." + tableSource + " a ";
      cadena2 = cadena2 + " LEFT JOIN " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ() + "." + tableSource + " b ";
      cadena2 = cadena2 + " ON a." + indice + " = b." + indice + " ";
      cadena2 = cadena2 + " and a.Source_IVY = b.Source_IVY ";
      cadena2 = cadena2 + " where b." + indice + " is null";

      return cadena + this.newLine + cadena2;

  }

  analizar_Query_Prog_CZ(tableSource: string, indice: string, opt: number)
  {
      /*Revisar campos Modified_Date*/
      var cadena = "";
      var cadena_source = "";
      if (opt == 1)
      {
          cadena_source = "National";
      }
      else
      {
          cadena_source = "Canary";
      }

      cadena = "select convert(date,isnull(MAX(maxDate),'2019-01-01')) as maxDate, isnull(max(IDMax),0) as IDMax from (SELECT max(Created_Date) as maxDate, max(" + indice + ") as IDMax from " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ() + "." + tableSource + " where Source_IVY = '" + cadena_source + "' ";
      cadena = cadena + " union all "; //esta y la de abajo
      cadena = cadena  + " SELECT max(Modified_Date) as maxDate, max(" + indice + ") as IDMax from " + this.analizar_DB_CZ() + "." + this.analizar_Schema_CZ() + "." + tableSource + " where Source_IVY = '" + cadena_source + "' ) as a";

      return cadena;
  }

}
