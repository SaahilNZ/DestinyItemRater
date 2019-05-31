class AbstractActionsModel implements AltJS.ActionsClass {
    constructor(alt: AltJS.Alt) { }
    actions?: AltJS.Actions;
    dispatch: (...payload: any[]) => void;
    generateActions?: (...action: string[]) => void;
}

export default AbstractActionsModel;