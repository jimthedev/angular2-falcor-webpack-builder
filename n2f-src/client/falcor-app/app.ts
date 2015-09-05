/// <reference path="../typings/_custom.d.ts" />

/*
 * Angular 2 decorators and servces
 */
import {Directive, Component, View} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

/*
 * Falcor
 */
import * as falcor from 'falcor';
import {XMLHttpSource as httpDataSource} from 'falcor-http-datasource';
import * as _ from 'lodash';
import * as JsDiff from 'diff';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app'
})
@View({
  // needed in order to tell Angular's compiler what's in the template
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES ],
  styles: [`
    * { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; font-family: Arial, Helvetica, sans-serif; }
    .title { font-family: Arial, Helvetica, sans-serif; margin: 2%; }
    falcor-example { display:flex; justify-content: space-between; flex-wrap: wrap; margin: 20px; font-family: Arial, Helvetica, sans-serif; -webkit-flex-direction: column; flex-direction: column;}
    column { background-color: #efefef; padding: 2px; width: 48%; overflow-x:scroll; border-radius:11px; }
    @media screen and (min-width: 600px){
      falcor-example {
        -webkit-flex-direction: row;
        flex-direction: row;
      }
    }

    @media screen and (max-width: 599px) {
      column {
        width: 96%;
        margin-bottom: 8px;
      }
    }
    
    falcor-top { background: #fff; border-top-left-radius: 10px; border-top-right-radius: 10px; border-bottom-left-radius: 0; border-bottom-right-radius: 0; padding: 8px; margin-bottom: 2px; display:flex; }
    falcor-controls { padding: 2%; width: 96%; }
    falcor-cache-diff { white-space: pre; font-family: monospace; }
    filter-status { display:block; text-align:right; color: #bbb; padding-right: 12px; padding-top: 6px; padding-bottom: 6px; font-size: 14px; }
    falcor-contents { background: #ddd; display:block; -webkit-border-radius: 11; -moz-border-radius: 11; border-radius: 11px; padding-bottom: 4px; }
    h6 { font-family: Arial, Helvetica, sans-serif; font-size: 16px; }
    .right { text-align:right; }
    employee-list { display:block;background: #fff; padding: 8px; margin-top: 1px; margin-bottom: 0px; }
    button {
      -webkit-border-radius: 11;
      -moz-border-radius: 11;
      border-radius: 11px;
      font-family: Arial;
      color: #383838;
      font-size: 16px;
      background: #ffffff;
      background-image: -webkit-linear-gradient(top, #ffffff, #f2f2f2);
      background-image: -moz-linear-gradient(top, #ffffff, #f2f2f2);
      background-image: -ms-linear-gradient(top, #ffffff, #f2f2f2);
      background-image: -o-linear-gradient(top, #ffffff, #f2f2f2);
      background-image: linear-gradient(to bottom, #ffffff, #f2f2f2);
      padding: 10px 20px 10px 20px;
      border: solid #0075bd 2px;
      text-decoration: none;
    }

    button:hover {
      background: #ffffff;
      text-decoration: none;
    }
    button::-moz-focus-inner {
      border: 0;
    }
    button:focus { 
      outline: none; 
    }
  `],
  template: `
  <header>
    <h1 class="title">Hello {{ name }}</h1>
  </header>

  <main>
    <falcor-example>
      <column>
        <falcor-contents>
          <falcor-top>
            <falcor-controls>
              <button (click)="loadMore()" *ng-if="myEmployeeLists.length !== myEmployeeListsTotalLength">Load more</button>
              <button (click)="clearMyEmployeeLists()" *ng-if="myEmployeeLists.length === myEmployeeListsTotalLength">Clear list</button>
              <button (click)="invalidateFalcorModelCache()">Clear cache</button>
            </falcor-controls>
          </falcor-top>
          <my-employee-lists *ng-for="#myEmployeeList of myEmployeeLists">
            <employee-list>
              <name>{{myEmployeeList.name}}</name>
            </employee-list>
          </my-employee-lists>
        </falcor-contents>
        <filter-status *ng-if="myEmployeeListsTotalLength">Showing {{ myEmployeeLists.length }} of {{ myEmployeeListsTotalLength }} total.</filter-status>
      </column>
      <column>
        <h6>Falcor's in-memory cache</h6>
        <falcor-cache-diff [inner-html]='falcorModelCacheDiff'></falcor-cache-diff>
      </column>
    </falcor-example>
    <h3>Original Angular 2 example</h3>
    <div>
      <input type="text" [(ng-model)]="name" autofocus>
    </div>
    <pre>this.data = {{ data | json }}</pre>
  </main>

  <footer>
    WebPack Angular 2 Starter by <a href="https://twitter.com/AngularClass">@AngularClass</a>
  </footer>
  `
})
export class App {
  // Original stuff from angular-class
  name: string;
  data: Array<any> = []; // default data
  
  // Array to hold our items
  myEmployeeLists: Array<any> = [];

  // Holds the total count of myEmployeeLists. This is different
  // than the current length of the array because we may only
  // have part of the result set in cache but want to know an
  // overall count for paging purposes.
  private _myEmployeeListsTotalLength: number;

  // Filter range
  myEmployeeListsFilterStart: number = 0;
  myEmployeeListsFilterEnd: number = -1;

  // Used for logging the falcor cache
  falcorModelCacheSnapshot: any;
  previousFalcorModelCacheSnapshot: any;
  falcorModelCacheDiff: string;

  get myEmployeeListsTotalLength(): number {
    if(!this._myEmployeeListsTotalLength) {
      return 0;
    } else {
      return this._myEmployeeListsTotalLength;
    }
  }

  set myEmployeeListsTotalLength(length: number) {
    this._myEmployeeListsTotalLength = length;
  }

  get myEmployeeListsFilterWidth(): number {
    if(!this._myEmployeeListsTotalLength) {
      return 0;
    }
    var filterDiff: number = this.myEmployeeListsFilterEnd - this.myEmployeeListsFilterStart;
    
    var filterLength: number;

    if(filterDiff === 0) {
      filterLength = 1
    } else {
      filterLength = filterDiff + 1;
    }

    return Math.max(filterLength, 0);
  }

  model: any;
  batchModel: any;

  constructor() {
    this.name = 'Angular 2 + Falcor';

    // Set up the remote model
    this.model = new falcor.Model({
      source: new httpDataSource('/model.json'),
      onChange: this.updateFalcorModelCacheSnapshot
    });

    // Get the batch version of the model
    this.batchModel = this.model.batch();

    this.loadInitialMyEmployeeLists();
  }

  /*
   * Display the current contents of the falcor cache
   * TODO: This might be a good candidate for a reducer.
   */
  updateFalcorModelCacheSnapshot = () => {
    console.log('this.falcorModelCacheDiff', this.falcorModelCacheDiff);
    console.log('this.falcorModelCacheSnapshot', this.falcorModelCacheSnapshot);
    console.log('this.previousFalcorModelCacheSnapshot', this.previousFalcorModelCacheSnapshot);

    if(!this.falcorModelCacheDiff ) {
      // There is no diff so just employee the current cache state
      this.falcorModelCacheSnapshot = this.model.getCache() || {};
      this.falcorModelCacheDiff = JSON.stringify(this.falcorModelCacheSnapshot, null, 4);
    } else {
      // There is a diff. Shift state and employee the new diff
      this.previousFalcorModelCacheSnapshot = this.falcorModelCacheSnapshot;
      this.falcorModelCacheSnapshot = this.model.getCache() || {};
      this.falcorModelCacheDiff = this.getFormattedDiff(this.previousFalcorModelCacheSnapshot, this.falcorModelCacheSnapshot);
    }
  }

  invalidateFalcorModelCache = () => {
    // If we wanted to just invalidate one path we could
    // do something like this:
    // 
    // this.model.invalidate(['myEmployeeLists']);

    // But since we just want to blow it all away
    // we'll use this:
    this.model.setCache();
    this.updateFalcorModelCacheSnapshot();
  }

  clearMyEmployeeLists = () => {
    this.myEmployeeLists = [];
    this.myEmployeeListsFilterEnd = -1;
  }

  loadInitialMyEmployeeLists() {

    // Query the model, we get back an observable
    var myEmployeeListsObservable = this.model.get(
      ['myEmployeeLists', 'length'],
      ['myEmployeeLists', { from: this.myEmployeeListsFilterStart, to: this.myEmployeeListsFilterEnd}, 'name']
    ).pluck('json');

    // Bind the response observable to the observer that will handle changes
    myEmployeeListsObservable.pluck('myEmployeeLists').subscribe(this.myEmployeeListsObserver);
    myEmployeeListsObservable.pluck('myEmployeeLists').subscribe(this.myEmployeeListsLengthObserver);
  }
  

  /*
   * Handle the total item count that the model knows about
   * This number could be very large so we'd use it for paging.
   */
  myEmployeeListsLengthObserver = (myEmployeeLists) => {
    this._myEmployeeListsTotalLength = myEmployeeLists.length;
  }

  /*
   * Handle processing items that that the model knows about.
   * Apply a filter to make sure that we only display items that
   * match current filter settings.
   */
  myEmployeeListsObserver = (myEmployeeLists) => {
    // Transform raw results to a usable array given a contiguous range.
    var results = [];
    for(let i=this.myEmployeeListsFilterStart;i<this.myEmployeeListsFilterEnd+1;i++) {
      results.push(myEmployeeLists[i]);
    }
    this.myEmployeeLists = results;
  }

  /*
   * Load more items from the server as needed. This method should
   * trigger an http request that only gets the items needed that are
   * currently not in the Falcor cache.
   */
  loadMore() {

    // Set a new end point to our range filter
    this.myEmployeeListsFilterEnd++;

    // Load more data according to new filters state
    // Filter states could be a good place for using redux 
    var moreMyEmployeeListsObservable = this.model.get(
      ['myEmployeeLists', 'length'],
      ['myEmployeeLists', { from: this.myEmployeeListsFilterStart, to: this.myEmployeeListsFilterEnd}, 'name']
    ).pluck('json');

    // Set up our observers. Again, they process results from the model.
    moreMyEmployeeListsObservable.pluck('myEmployeeLists').subscribe(this.myEmployeeListsObserver);
    moreMyEmployeeListsObservable.pluck('myEmployeeLists').subscribe(this.myEmployeeListsLengthObserver);
  }

  getFormattedDiff(oldObject, newObject): string {
    let oldJson = JSON.stringify(oldObject, null, 4);
    let newJson = JSON.stringify(newObject, null, 4);

    // TODO: remove if angular supports styling inner-html
    // This is an icky hack but we must do it since Angular doesn't
    // currently apply View styles to nodes inserted via inner-html
    return JsDiff.convertChangesToXML(JsDiff.diffLines(oldJson, newJson)) + 
      `\n<style>
        ins { 
          text-decoration:none;
          color: #4F8A10;
          background-color: #DFF2BF;
        } 
        del { 
          color: #D8000C;
          background-color: #FFBABA;
        }
      </style>`;
  }
  
  getData() {
    // fake async call
    setTimeout(() => {
      let data = [
        { value: 'finish example', created_at: new Date() }
      ];
      
      // fake callback
      this.data = data;

    }, 2000);

  }

}
