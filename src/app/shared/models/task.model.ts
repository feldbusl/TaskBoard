import { SafeHtml } from '@angular/platform-browser';

import { Attachment } from './attachment.model';
import { Category } from './category.model';
import { Comment } from './comment.model';
import { User } from './user.model';

export class Task {
  public comments: Comment[];
  public attachments: Attachment[];
  public assignees: User[];
  public categories: Category[];
  public html: SafeHtml;

  public filtered: boolean;
  public hideFiltered: boolean;

  constructor(public id: number = 0,
              public title: string = '',
              public description: string = '',
              public color: string = '#ffffe0',
              public due_date: string = '', // tslint:disable-line
              // tslint:disable-next-line:variable-name
              public creation_date: string = Date.now().toString(),
              // tslint:disable-next-line:variable-name
              public finish_date: string = '',
              public points: number = 0,
              public position: number = 0,
              public column_id: number = 0, // tslint:disable-line
              commentArray: any[] = [],
              attachmentArray: any[] = [],
              assigneeArray: any[] = [],
              categoryArray: any[] = []) {
    this.comments = [];
    this.attachments = [];
    this.assignees = [];
    this.categories = [];

    commentArray.forEach((comment: any) => {
      this.comments.push(new Comment(+comment.id,
        comment.text,
        +comment.user_id,
        +comment.task_id,
        +comment.timestamp,
        +comment.is_edited === 1));
    });

    attachmentArray.forEach((attachment: any) => {
      this.attachments.push(new Attachment(+attachment.id,
        attachment.filename,
        attachment.diskfilename,
        attachment.name,
        attachment.type,
        +attachment.user_id,
        +attachment.timestamp,
        +attachment.task_id));
    });

    assigneeArray.forEach((user: any) => {
      this.assignees.push(new User(+user.default_board_id,
        user.email,
        +user.id,
        user.last_login,
        +user.security_level,
        +user.user_option_id,
        user.username,
        user.board_access,
        user.collapsed));
    });

    categoryArray.forEach((category: any) => {
      this.categories.push(new Category(+category.id,
        category.name,
        category.default_task_color,
        +category.board_id));
    });
  }
}

