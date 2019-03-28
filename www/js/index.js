/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * 
 * // Local Notifications:
// https://www.npmjs.com/package/de.appplant.cordova.plugin.local-notification/v/0.8.5
// https://github.com/katzer/cordova-plugin-local-notifications/wiki - reference


// Installation
// cordova plugin add de.appplant.cordova.plugin.local-notification

//Build (XCode 10 causes build issues for iOS so it needs the --buildFlag)
// cordova emulate ios --target="iPhone-8, 12.1" --buildFlag="-UseModernBuildSystem=0"

// Dialogs:
// https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-dialogs/index.html
 */

let app = {

    homepage: document.querySelector('.homepage'),
    addpage: document.querySelector('.addpage'),
    detailpage: document.querySelector('.detailpage'),
    
    init: function () {
        document.addEventListener("deviceready", app.ready);
    },
    ready: function () {
        console.log("ready");
        // cordova.plugins.notification.local.cancelAll(function() {alert("done");}, this);
        // cordova.plugins.notification.local.clearAll();
        // document.querySelector('.todolist').innerHTML = '',

        app.generateList();
        app.addListeners();
    },

    generateList: function () {
        console.log('generate list here');
        let list = document.querySelector('.todolist');
        list.innerHTML = '',

        cordova.plugins.notification.local.getAll(notes => {
            notes.sort(function(a, b){
                let keyA = new Date(a.at), keyB = new Date(b.at);
                if(keyA < keyB) return -1;
                if(keyA > keyB) return 1;
                return 0;
            });

            console.log('generate list');
            console.log(notes);
            // ids is an array of all the ids of scheduled notifications

            // let entry = document.createElement('li');
            // let test = document.createTextNode("test");
            // let div4 = document.createElement('div');
            // div4.innerHTML += test;
            // entry.appendChild(div4);
            // list.appendChild(entry);

            notes.forEach(note => {
                let entry = document.createElement('li');
                entry.classList.add('entry');
                entry.classList.add('grid');
                entry.setAttribute("data-id", note.id);
                entry.addEventListener('click', app.showDetail)

                let date = document.createTextNode(note.data);
                let dateContainer = document.createElement('p');
                dateContainer.appendChild(date);
                dateContainer.classList.add('item1')
                entry.appendChild(dateContainer);

                let title = document.createTextNode(note.title);
                let titleContainer = document.createElement('p');
                titleContainer.appendChild(title);
                titleContainer.classList.add('item2');
                entry.appendChild(titleContainer);

                // let deleteBtn = document.createElement('button');
                let deleteImg = document.createElement('img');
                deleteImg.classList.add('home-del');
                deleteImg.classList.add('item3');
                // deleteImg.src = "../img/icons8-trash-50.png";
                deleteImg.src = "./img/icons8-waste-50.png";
                // deleteImg.src = 'https://img.icons8.com/ios/50/000000/waste.png';
                deleteImg.alt = 'delete';
                deleteImg.title = 'delete';
                deleteImg.height = 25;
                deleteImg.addEventListener('click', function(){
                    entry.removeEventListener('click', app.showDetail);
                    entry.classList.add('to-be-del');
                    let message = "Are you sure you want to delete this reminder?";
                    navigator.notification.confirm(message, app.confirmHome, 'Confirmation', ['Cancel', 'Delete'])
                });
                entry.appendChild(deleteImg);

                list.appendChild(entry);
            })
        });
    },

    addListeners: function () {

        document.querySelector("#add-btn").addEventListener("click", function(){
            app.homepage.classList.add('hide');
            app.addpage.classList.remove('hide');
        });
        document.querySelector('#cancel-btn').addEventListener("click", function () {
            app.homepage.classList.remove('hide');
            app.addpage.classList.add('hide');
        });
        document.querySelector('#save-btn').addEventListener("click", app.addNote);
        document.querySelector('#back-btn').addEventListener("click", function () {
            app.homepage.classList.remove('hide');
            document.querySelector('.detailpage').classList.add('hide');
        });

        //delete button on detailpage
        document.querySelector('#delete-btn').addEventListener("click", function(){
            let message = "Are you sure you want to delete this reminder?";
            navigator.notification.confirm(message, app.confirmDetail, 'Confirmation', ['Cancel', 'Delete'])
        });


        cordova.plugins.notification.local.on("click", function (notification) {
            // navigator.notification.alert("clicked: " + notification.title);
            //user has clicked on the popped up notification
            let notifications = document.getElementsByTagName('li');
            
            console.log(notifications);

            for (let i = 0; i < notifications.length; i++)
            {
                if (notifications[i].getAttribute('data-id') == notification.id) {
                    notifications[i].classList.add('highlight');
                    setTimeout(() => {
                        notifications[i].classList.remove('highlight');
                    }, 5000);
                }
            }
        });

        cordova.plugins.notification.local.on("trigger", function (notification) {
            //added to the notification center on the date to trigger it.
            // navigator.notification.alert("triggered: " + notification.title);
            //set another reminder
        });
    },

    addNote: function (ev) {

        let props = cordova.plugins.notification.local.getDefaults();
        //console.log(props);
        /**
         * Notification Object Properties - use it as a reference later on
         * id
         * text
         * title
         * every
         * at
         * data
         * sound
         * badge
         */

        // let inOneMin = new Date();
        // inOneMin.setMinutes(inOneMin.getMinutes() + 1);


        let datetime = document.getElementById('datetime').value;
        let monthNames = [
            "January", "February", "March","April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
        
        let month = monthNames[new Date(datetime).getUTCMonth()]; 
        // let month = new Date(datetime).getUTCMonth(); 
        let date = new Date(datetime).getUTCDate();
        let monthdate = `${month} ${date}`;

        if(luxon.DateTime.fromISO(datetime) >= luxon.DateTime.local()){
            remindDate = luxon.DateTime.fromISO(datetime).minus({ days: 7 }).toISODate();
        } else {
            datetime = luxon.DateTime.fromISO(datetime).plus({ year: 1 }).toISODate();
            remindDate = luxon.DateTime.fromISO(datetime).plus({ year: 1 }).minus({ days: 7 }).toISODate();   
        }

        remindDate = new Date(remindDate);  
        console.log(remindDate);

        let noteOptions = {
            id: new Date(),
            title: document.getElementById('title').value,
            text: document.getElementById('content').value,
            at: remindDate,
            badge: 1,
            data: monthdate
        };

        
        cordova.plugins.notification.local.schedule(noteOptions, ()=>{
            app.generateList();

        });

        app.homepage.classList.remove('hide');
        app.addpage.classList.add('hide');

        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('datetime').value = '';

    },

    showDetail: function (ev) {
        app.homepage.classList.add('hide');
        app.detailpage.classList.remove('hide');

        console.log(ev);

        let id = ev.currentTarget.getAttribute('data-id');
        let title = ev.currentTarget.getAttribute('title');
        document.getElementById('delete-btn').setAttribute('data-id', id);

        cordova.plugins.notification.local.get(id, note => {
            //note will be the object with all the details about the notification.
            let month = note.at.getUTCMonth() + 1; 
            let day = note.at.getUTCDate() + 7;//from remind date to todo date
            let year = note.at.getUTCFullYear();
            document.getElementById('titleDisplay').textContent = note.title;
            document.getElementById('contentDisplay').textContent = note.text;
            document.getElementById('dateDisplay').textContent = `${month} ${day} ${year}`;
            document.getElementById('timeDisplay').textContent = note.at.getTime();
          });

    },

    confirmDetail: function(buttonIndex) {
        if (buttonIndex == '2'){
            let id = document.querySelector('#delete-btn').getAttribute('data-id');
            app.deleteNote(id);
        }
    },

    confirmHome: function(buttonIndex) {
        if (buttonIndex == '2'){
            let id = document.querySelector('.to-be-del').getAttribute('data-id');
            app.deleteNote(id);
        }
        
        
    },

    deleteNote: function (id) {

        cordova.plugins.notification.local.isTriggered(id, function () {
            cordova.plugins.notification.local.clear(id, function () {
                // will dismiss a notification that has been triggered or added to notification center
                app.generateList();
            });
        });
        //     // navigator.notification.alert(present ? "present" : "not found");
        //     // can also call isTriggered() or isScheduled()
        //     // getAllIds(), getScheduledIds() and getTriggeredIds() will give you an array of ids
        //     // get(), getAll(), getScheduled() and getTriggered() will get the notification based on an id
        // });
        
        cordova.plugins.notification.local.isScheduled(id, function () {
            cordova.plugins.notification.local.cancel(id, function () {
                // will get rid of notification id 1 if it has NOT been triggered or added to the notification center
                app.generateList();
            });
        });



        app.homepage.classList.remove('hide');
        app.detailpage.classList.add('hide');
        
    },

};
app.init();