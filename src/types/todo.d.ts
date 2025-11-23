export interface ICreateTodo {
    message: string;
    completed: boolean;
}

export interface ITodoItem extends ICreateTodo {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}