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
- Working on passing winners through to next round⌛currently working on getting winner determination working✅

- create view cup❌
- tree format as the rounds are created, shows scores from that game week.❌

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

20. view lavery cup

21. Test cups and format

22. Make Dashboard

- add functionality to dashboard
- add message section to dashboard
- add rules section and note from chris to dashboard.

23. Desired features

- add colour coding to scores modal✅
- correct all page titles and button titles and labels.✅
- my predictions, needs better titles, (game week, live start, predictions open and close)✅
- view game week, change to (title: game week, sub: as is live open to close )✅
- edit game week, change to (title: game week, sub: as is live open to close )✅
- enter scores, change to (title: game week, sub: as is live open to close )✅
- history page, seasons winners cup winners etc. needs supabase table
- add season name as title to view seasons page

23. Bugs

- page flickers and needs refresh when draw second round of cup. Loop issue in the perform draw function.This rerendering is causing lots of rest api calls this could become a big issue.
- add loading... to view seasons page when fetching seasons.
- check routing to ensure that players who are logged in, get redirected from log in to the dashboard.

24. Test thoroughly with 1 player and 1 host

25. Prepare for beta testing

26. Update ReadMe and announce on LinkedIn

27. Receive feedback and fix bugs/make improvements
