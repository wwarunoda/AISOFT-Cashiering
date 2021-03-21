import { Task } from "./task";

export interface DragDrop {
  title?: string;
  id?: number;
  connectedTo?: any[];
  item?: Task[];
}
