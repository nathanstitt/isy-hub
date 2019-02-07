import { EventEmitter } from 'events';
import { Controls, ISY } from './isy';

export class ISYNode {
    public readonly isy: ISY;
    public readonly flag: any;
    public readonly nodeDefId: string;
    public readonly address: string;
    [x: string]: any;
    public name: string;
    public family: any;
    public parent: any;
    public readonly elkId: string;
    public nodeType: number;
    public propertyChanged: EventEmitter;
    public propsInitialized: boolean;
    public logger: (msg: any) => void;
    public lastChanged: Date;
    public enabled: boolean;
    constructor(isy: ISY, node) {
        this.isy = isy;
        this.nodeType = 0;
        this.flag = node.flag;
        this.nodeDefId = node.nodeDefId;
        this.address = node.address;
        this.name = node.name;
        this.family = node.family;
        this.parent = node.parent;
        this.enabled = node.enabled;
        this.elkId = node.ELK_ID;
        this.propertyChanged = new EventEmitter();
        this.propsInitialized = false;
        this.logger = (msg) => {
            return isy.logger(`${this.name} (${this.address}): ${msg}`);
        };
        this.logger(this.nodeDefId);
        this.lastChanged = new Date();
    }

    public handlePropertyChange(propertyName, value, formattedValue): boolean {
        this.lastChanged = new Date();
        return true;
    }

    public handleEvent(event) {
        let actionValue = null;
        if (event.action instanceof Object) {
            actionValue = event.action._;
        } else if (event.action instanceof Number || event.action instanceof String) {
            actionValue = Number(event.action);
        }

        if (event.control in this) {
            // property not command
            const formatted = 'fmtAct' in event ? event.fmtAct : actionValue;
            return this.handlePropertyChange(event.control, actionValue, formatted);
        } else {
            // this.logger(event.control);
            const e = event.control;
            const dispName = Controls[e];
            if (dispName !== undefined && dispName !== null) {
                this.logger(`Command ${dispName.label} (${e}) triggered.`);
            } else {
                this.logger(`Command ${e} triggered.`);
            }
            return false;
        }
    }

    public onPropertyChanged(propertyName = null, callback) {
        if (propertyName === null) {
            this.propertyChanged.addListener('', callback);
        } else { this.propertyChanged.addListener(propertyName, callback); }
    }
}
