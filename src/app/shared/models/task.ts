export interface Task {
  id?: number;
  guid?: string;
  boardId?: string;
  description?: string;
  name?: Date;
  dueDate?: Date;
  startDate?: Date;
  createdOn?: Date;
  columnIndex?: number;
  isDraggable?: boolean;
  columnStatus?: any[];
  assignee?: any[];
}
