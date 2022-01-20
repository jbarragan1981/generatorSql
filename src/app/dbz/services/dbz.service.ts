import { Injectable } from '@angular/core';
import { Proceso } from '../interfaces/dbz.interface';


@Injectable()
export class DbzService {
    
    private _procesos: Proceso[] = [
        
    ];

    get procesos(): Proceso[] {
        return [...this._procesos];
    }

    constructor() {}

    agregarConsulta( proceso: Proceso ) {
        this._procesos.push( proceso );

        //crear archivo

    }

}