# Project Plan

1. Reverted back to manual fixture entry until i find a free api or build a webscraper. ✅

2. Test this is working. Both ways✅

3. Create Edit Game Week component, with manual entry✅

4. Again test this all works✅

5. Create View game week options component✅

6. Create Game week options individual components (view fixtures, view MOTW). These will need to be linked to Supabase for data✅

7. Test everything is working and linked to Supabase correctly✅

8. Update ReadMe✅

9. Create enter scores functionality✅

10. Test enter scores functionality✅

---

## bugs

- back to seasons buttons show under hamburger icon, need to be moved down so they are seperate.✅
- admin page needs centering✅
- responsive design repairs:
- Predictions form elements over lap✅
- fix enter scores and view seasons to not have left margin✅
- Fix enterscores form and display to have cancel and back buttons.✅
- View seasons, (view players, Edit players, View game week, create/edit game week. All not fitting in box).✅
- View game week, game weeks are to vertical need to be more horizontal.✅
- in game week view, (View Scores and View manager of the week not fitting in the box)✅
- in create/edit game week (create game week and edit game week not fitting in box)✅
- the create game week form is too thin and crushes elements.✅
- in edit game week, game weeks are too vertical and not horizontal✅
- the edit game week form is too thin and crushes elements.✅
-
- create season modal confirmation screen needed✅
- view scores modal in view seasons can now be updated to collect scores from supabase predictions table✅

---

11. add edit score entries section for hosts.

- create enter correct scores button for host.✅
- create enter scores form and link to supabase fixtures table✅
- add correct scores to scores modal✅

12. Create scoring league table view and add this where desired (dashboard) and view seasons

    - create player game week score table on supabase (game_week_id, player_id, corectscores, points)✅
    - create player season score table on supabase (season_id, player_id, corectscores, points)✅
    - create functionality to update the game_week_scores(This will need to be done from a logic place, when the host updates scores) This will then update the season score table as well. (This can be done from adding the points and correct scores in the game week score table)✅
    - add view table button to view season✅
    - create league table that pulls and sorts from player scores ( try to make this sortable by position, name, correct scores and points)✅

13. Test scoring and table works✅

14. Add in cup competitions, rules and format✅

- george cup✅
- navigating rounds doesn't change the round view, still showing previous round fixtures. ✅\*\* now working but not showing blank fixtures.
- edit rounds not working, could this be because the round has been completed. Need to test this by creating a new game week.\*\* now games confirmation is not working. Nothing being created on supabase.✅
- game weeks can still be changed after confirmed, this needs to be locked in.✅
- rounds not being counted and next round goes forever.\*\* now working when you arrive at the page, but not working when you have created fixtures, also further rounds still showing first rounds fixtures.✅
- submit is not working when editing a cup round.✅
- first round fixtures are showing in the right hand column in all rounds( when a new round has been selected by using the arrows on the header.)✅
- ensure that once fixtures have been selected that they are in place when returning to this screen.✅
- Working on passing winners through to next round, currently working on getting winner determination working✅

15. Make it so that scores do not show unitl the live fixtures start✅

16. rebuild the cups from the start. We can now have fixtures picked by computer.✅

17. build edit george cup page✅

- get players and rounds showing✅
- get fixture selection working✅
- No duplicate rows in george_cup_rounds table✅
- Players persist after page refresh✅
- Draw functionality creates fixtures✅
- Players names and scores display correctly✅
  \*\*game week id is blank on george_cup_fixtures table once game week has been selected. this isn't needed as the game week is logged on the george_cup_rounds table as well.✅
- Fix winner/loser color highlighting, Debug winner/loser class ✅
- application in fixture display, Verify winner_id is being set correctly✅
- get players to start with 0-0 predictions until they have changed predictions.✅
- round progression working just needs display fix
- lock new rounds drop down menu until required amount of players are ready.
- update logic to handle drawing scenarios✅ This has caused flickering on a coin toss, need to fix
  Suggested fix: 1. Generate the random selection once 2. Store that result 3. Use that same result consistently✅
- Implement round progression, Create function to check for round winners on page load, Add logic to progress winners to next round when all fixtures complete, Update database and UI to reflect progressed players✅ This is working, but there is an issue with the new fixture flickering until there has been a refresh. ⌛
- check progression to final and overall winner.✅
- lock drop down menu on future rounds until players have been decided for this round✅
- add styles where needed ( each column is individually scroll able when population flows over screen, players names have a line through them when knocked out in the players column)✅

18. Create view george cup component✅

- winners column✅
- highlight me✅
- moved the back button on editGeorgeCup as well✅

19. create lavery cup

- Create base page and link to view seasons✅
- create round creation and link to game week✅
- edit enterscores form to add lavery cup selection and link to supabase✅
- edit predictions display to also show lavery cup selection✅
- update enter scores to allow for lavery cup markings. Add second page if there is a lavery cup. This page will have the teams that have been selected, host will need to tick the winners. Then submit. The modal will then show the two pages, first the correct scores, when you hit confirm you will then see the second page of the modal, the lavery cup selections and markings. When you hit confirm on this we will then update the supabase as already set we will also now update the lavery_cup_rounds table is_complete and update the lavery_cup_selections table team1_won and team2_won on supabase.✅
- lavery cup issues✅
- modal flow not working - opening modal on page 2, buttons are not taking you to the correct places.
- update leagues button issues✅
- if team is not selected then boolean should be updated to false on lavery_cup_selection table.✅
- if both booleans are true then should also update the advanced column on lavery_cup_selection table✅
- check round progression to winner✅
- check reset lavery cup function✅

20. view lavery cup✅

- Create base page and link to view seasons✅
- create view lavery cup component✅
- have in rounds, similar to the george cup with scrollable columns and player list which is checked off✅
- show selections only after live start✅
- mark selections as correct or incorrect once scores are in.✅

- my predictions, an entered form says elminated on lavery cup before host has entered scores, this should say waiting on results.✅
- george cup doesn't show winners or player vs player games until next round is drawn, winners should show as soon as there are points in place.✅
- one round complete and one player shows as winner, winner should only show when one player is left and all others eliminated. Once a second round it added, the winners column is removed.✅
- players not being checked off on the players list when eliminated.✅
- SCORE BREAKDOWN NOT SHOWING ON CLOSED ENTERSCORES CARDS✅

1. Lavery Cup Prediction Status Fix✅
   Issue: Players see "Eliminated" status before host enters scores
   Fix: Change status to "Waiting on results" when team1_won/team2_won are null
   Location: PredictionsDisplay component
2. Lavery Cup Winner Column Logic✅
   Issue: Winner column appears too early and disappears when second round is added
   Fix: Only show winner column when all rounds are complete AND only one player remains
   Location: ViewLaveryCup component, within the IIFE that renders the winner column
3. Lavery Cup Player Elimination Visual Indication✅
   Issue: Players aren't visually marked as eliminated in the player list
   Fix: Add strike-through or visual indicator for eliminated players
   Location: Player list in ViewLaveryCup component
4. EnterScores Score Breakdown Display✅
   Issue: Score breakdown not showing on closed EnterScores cards
   Fix: Ensure breakdown appears correctly after scores submitted
   Location: EnterScores component or related display components
5. George Cup Winners Display✅
   Issue: Winners don't show until next round is drawn
   Fix: Update winners as soon as points are in place
   Location: ViewGeorgeCup component, winner determination logic
6. players remaining number is wrong in view lavery cup.✅

- Colour coding issues on show scores cells seems to be Correct Score (0-3 goals) and Correct Results not showing.✅
- league table not adding weekly scores, just showing the most recent weeks scores. Not updating the season_scores table on supabase.✅

- no winners show reset coming warning structure in place needs testing ✅
- every one needs to go all out in the next round, see what happens. add a pending for reset screen in view lavery cup if needed.✅
- create a reset lavery cup button with typing confirmation in edit lavery cup. make sure this deletes only the information needed.✅
- check that lavery cup can restart.✅

21. Test cups and format ✅

22. Make Dashboard ✅

- add functionality to dashboard - indiviual squares containting different components, when clicked these will take you to the links, they will show on the dashboard page with the below views.✅

  Content(

enter scores✅

- link - link to enter scores page✅
- dashboard view - coniditon of most recent game week. game week is the week that open for predictions time has passed most recently✅

  24/25 season League✅

- link - takes you to viewseasons, with the current season props✅
- dashbaord view - top 6 of the table showing, your place showing if not in top 6 and only top 5 show✅

  24/25 season George Cup ✅

- link - takes you to view george cup page, with current season props
- dashbaord view - shows your current fixtures and round, if you have been knocked out this will show the current round and underneath say the round you were knocked out on: For Example "George Cup Semi Finals - Live 09/05/25. You were knocked out in the 2nd Round"

  24/25 season Lavery Cup ✅

- link - takes you to view Lavery Cup page, with current season props
- dashbaord view - shows your current round and your selections, if they have been marked whether or not they were correct and at the bottom advanced or eliminated, if you have been knocked out and a new round is starting this will show the current round and underneath say the round you were knocked out on: For Example "Lavery Cup Semi Finals - Live 09/05/25. You were knocked out in the 2nd Round"

messages✅

- link - messages page, list of measages that host has posted, add, edit and delete message button for hosts only. Host can also pin and unpin messages.

rules✅

- link - rules page, rules listed.✅
- dashboard view - just a title no need for anything live.✅
- Also add this to side bar menu.✅

  )

23. Desired features

- add colour coding to scores modal✅
- correct all page titles and button titles and labels.✅
- my predictions, needs better titles, (game week, live start, predictions open and close)✅
- view game week, change to (title: game week, sub: as is live open to close )✅
- edit game week, change to (title: game week, sub: as is live open to close )✅
- enter scores, change to (title: game week, sub: as is live open to close )✅
- add season name as title to view seasons page✅
- add title (season name) to viewseasons options view✅
-
- score modal - colour code key needs to have points added and weekly bonus needs to be added somewhere✅
- manager of the week modal need user highlighting✅
-
- Forgot password
-
- about me✅
- small page, add to side menu, that has information about me and the project, git hub links etc. Also add this to side bar menu.✅
-
- egg on your face, make a way of alerting those who scored less than a player who did not enter scores.
-
- history page, seasons winners cup winners etc. needs supabase table updated by other areas(individual comps)
- keep record of highest indivual score for a week and a game. Keep these displayed on dashboard. Winnner takes a prize.
-
- manager of the week history - somewhere that lists the manager of the weeks
- enterscores - when host enters scores this updates manager or the week table to keep track of winners, this is can be displayed in a season winners page. And also created a message for the message board on the dashboard
- create seasons winners page
-
- season progression chart, bar chart showing points earned over game weeks
-
- alerts for predictions open and close, can we email players to let them know?
-
- dashboard - links need to be routed to page with props, enter scores, league, george cup, lavery cup
- dashboard - george cup tile - should show when user was knocked out
-
- message panel - dashboard needs refreshed to show changes when adding deleting or editing messages
-
- Profile Settings - Delete account button needs to be added back
-
- all game lists - not working off of time, but off of date, this means host has to wait until midnight on the day of the last fixture to update the scores. I will need to ensure all logic is run through the utils/gameWeekStatus file for conformity and have this run on time rather than date.

23. Bugs

- URGENT - League table needs to be changed to match rules, add tie breaker.✅
- check routing to ensure that players who are logged in, get redirected from log in to the dashboard.✅
- game logic - scores not show points in my predictions until host has entered correct scores - my scores should not show host scores until host has entered them - This is causing players to see incorrect scores until host has entered correct scores.✅
- george cup - coin toss not done until host opens edit george cup component. This means players have to wait on host to manually flip a coin✅
- URGENT - host enter scores - when looking at the game weeks, a game week thats prediction window has closed but has not yet been edited says closed. This should say ready for correct scores or something like this. This may be fixed by the score modal issue where all correct scores show as 0-0 when the should be null.✅
- dashboard - need to test league tile view if you are not in the top 6✅
-
- add loading... to view seasons page when fetching seasons.✅
-
- enter scores any one who is signed up is able to enter scores, this should not be the case, only players game weeks should only show for player who are in that season on the season_players for the season that the game week is in.✅
-
- delete game week - errors where it deletes the fixtures but not the game week✅
- delete season needs correcting✅
- delete account as well✅
- Update readme to help this✅
-
- george cup tile is blank✅
-
- white space at bottom when scrolling down in mobile view in view george cup, view lavery cup, edit george cup. Check other areas also.✅
- view george cup - scroll bar for columns is just off bottom of the page, same for view lavery cup and edit george cup✅
-
- errors showing in console when going to my pedictions, enter scores page due to adding lavery cup selections
-
- enterscores - check that players change lavery cup selections when editing there scores. This creates multiple rows on the database and show when getting to host enter scores,'✅ Needs testing
-
- delete game week - needs to also clear lavery cup - players teams used, will need to add a new column to teams used table to link them to a game week to make this possible. This will be updated in enterscores when player makes a selection
-
- edit george cup, needs fixing, this live is currently broken✅
- page flickers and needs refresh when draw second round of cup. Loop issue in the perform draw function.This rerendering is causing lots of rest api calls this could become a big issue.✅
- need to fix view george cup, also further rounds to not seem to be randomly drawn✅

-
- George cup - bye vs bye both show as progressed, fixture should be hidden if no players involved.✅
-

24. Prepare for beta testing✅

25. Test thoroughly with 20 player and 20 host✅

- two lists of players from auth, actual players and those who have signed up but don't usually take part.✅

26. Update ReadMe and announce on LinkedIn✅

27. Receive feedback and fix bugs/make improvements✅
