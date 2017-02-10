# nightlife_coordination
A FreeCodeCamp challenge creating a night life coordination application using the yelp API, Node.js, Mongodb, Express.js, JQuery, Jade

# Objective: 
Build a full stack JavaScript app that is functionally similar to this: http://whatsgoinontonight.herokuapp.com/ and deploy it to Heroku.

Note that for each project, you should create a new GitHub repository and a new Heroku project. If you can't remember how to do this, revisit https://freecodecamp.com/challenges/get-set-for-our-dynamic-web-application-projects.

Here are the specific user stories you should implement for this project:

User Story: As an unauthenticated user, I can view all bars in my area.

User Story: As an authenticated user, I can add myself to a bar to indicate I am going there tonight.

User Story: As an authenticated user, I can remove myself from a bar if I no longer want to go there.

User Story: As an unauthenticated user, when I login I should not have to search again.


#Challenges:
The biggest obstacles to overcome were; routing(redirects), async behavior, mongodb updating behavior, buttons and configuration to Heroku. 
This was the first time utilizing a button click as a conditional; meaning, if you were a signed-in user you could click the button to attend otherwise you were redirected to log-in.  
I discovered I couldn't redirect when I seperated out a button click as a route and use JQuery AJAX. AJAX does not allow you to redirect once you've passed information to the url route used in the ajax call. 
My solution was to not use JQuery for this purpose. Instead I used Express.js functionality and kept the routes within the same file to make passing the data easier. I also wanted to use fewer files. Further reading is needed to find a cleaner and less cluttered solution. 
Not only is this probably bad practice it proved to be confusing. After spending longer than I planned for on finishing the application, I decided to utilize for loops (a.k.a. for-loop hell). 

I'm starting to see how async behavior is bitter-sweet for some. It can be challenging to understand. I used functions to compartmentalize behavior. I look forward to understand this better.

Mongodb challenged me with my updating and queries. I don't fully understand it, but updates could NOT be viewed immediately. I've read about mongodb having a type of 'lag'.
I watched my terminal and I could see that the database was updating however my browser wouldn't immediately show it. My solution was to use functions so that async behavior would finish before loading the page. 
I believe a solution is in the mongodb documentation, although I've not come across it yet. This issue is still happening when a second user clicks "going" on a bar someone else is attending. 
The button changes so that the user will see they have attended but the "totals" don't add up immediately.After reloading the page you see the update. I want to fix this, however the app currently meets the standards of the challange. 

I continue to have issues with getting my application to work on Heroku. I've come across conflicting information when it comes to config.js, .env and env.js files. 
Although I have loaded several working project already, each new project presents new differences. Such as this project using the Yelp API.  
