import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { DashboardService } from './dashboard.service';
import { StringsService } from '../shared/services';

interface BurndownDates {
  start: string;
  end: string;

  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'tb-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subs: any[];

  public boards: any;
  public boardsLoading: boolean;
  public boardsMessage: string;

  public tasks: any;
  public tasksLoading: boolean;
  public tasksMessage: string;

  public strings: any;
  public pageName: string;

  public analyticsBoardId: number;
  public burndownDates: BurndownDates;
  public datesError: string;
  public series: string;
  public burndownLabels: string;
  public burnDownData: any;

  get showBurndown() {
    return this.burndownDates.start &&
      this.burndownDates.end && !this.datesError.length;
  }

  constructor(public title: Title,
              private service: DashboardService,
              public stringsService: StringsService) {
    this.subs = [];
    this.boardsLoading = true;
    this.tasksLoading = true;

    this.burndownDates = {
      start: null,
      end: null,
      startDate: null,
      endDate: null
    };
    this.datesError = '';

    this.subs.push(
      stringsService.stringsChanged.subscribe(newStrings => {
        this.strings = newStrings;

        title.setTitle('Flip - ' + this.strings.dashboard);
        this.pageName = this.strings.dashboard;
      })
    );
  }

  ngOnInit() {
    this.service.getBoardInfo().subscribe(res => {
      this.boards = res.data[1];

      if (res.status === 'failure') {
        this.boardsMessage = res.alerts[0].text;
      }

      this.boardsLoading = false;
    });

    this.service.getTaskInfo().subscribe(res => {
      this.tasks = res.data[1];

      if (res.status === 'failure') {
        this.tasksMessage = res.alerts[0].text;
      }

      this.tasksLoading = false;
    });

    this.service.getBurndownData().subscribe(res => {
      this.burnDownData = res.data[1];
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  validateDates() {
    if (this.burndownDates.start === null || this.burndownDates.end === null) {
      return;
    }
    this.datesError = '';

    this.burndownDates.startDate = new Date(this.burndownDates.start);
    this.burndownDates.endDate = new Date(this.burndownDates.end);

    const start = this.burndownDates.startDate.valueOf();
    const end = this.burndownDates.endDate.valueOf();
    const now = new Date().valueOf();

    if (start > end) {
      this.datesError = 'End date must be after start date.';
    }

    if (start > now) {
      this.datesError += ' Start date must be today or earlier.';
    }

    this.updateAnalytics();

    /*if (end > now) {
      this.datesError += ' End date must be today or earlier.';
    }*/
  }

  updateAnalytics() {
    let minDate = '';
    const maxDate = Date.now().toString();
    const seriesArray = [];
    const labelArray = [];
    this.burnDownData.forEach(burndownTaskData => {
      // tslint:disable-next-line:triple-equals
      if (burndownTaskData.boardId == this.analyticsBoardId) {
        if (minDate === '' || minDate > burndownTaskData.creation_date) {
          minDate = burndownTaskData.creation_date;
        }
      }
    });
    // tslint:disable-next-line:radix
    const days = Math.floor((parseInt(maxDate) - parseInt(minDate)) / 1000 / 60 / 60 / 24);
    for (let i = 0; i <= days; i++) {
      labelArray[i] = this.strings.dashboard_day + ' ' + i;
      if (i === days) {
        labelArray[i] = this.strings.dashboard_today;
      }
      seriesArray[i] = 0;
      this.burnDownData.forEach(burndownTaskData => {
        // tslint:disable-next-line:triple-equals radix
        if (parseInt(minDate) + i*1000*60*60*24 >= burndownTaskData.creation_date
            // tslint:disable-next-line:triple-equals radix
            && ((parseInt(minDate) + (i+1)*1000*60*60*24 < burndownTaskData.finish_date
                || burndownTaskData.finish_date === '')
                || !burndownTaskData.finished)){
          // tslint:disable-next-line:radix
          seriesArray[i] += parseInt(burndownTaskData.points);
        }
      });
    }

    this.series = seriesArray.toString();
    this.burndownLabels = labelArray.toString();
  }
}

