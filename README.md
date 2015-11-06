# meetmeapp

“MeetMe” is a friend-finding/dating app that combines aspects of Uber/Lyft with
those of Tinder. Much like the “driver mode” in Uber/Lyft, users would toggle
their availability to meet up. While it’s active, the user can swipe through
other available people’s profiles (geographic distance would be adjustable)
much like that of Tinder to select people he/she is willing to meet up with
right now. Profiles would include some demographic information (age, ethnicity,
etc.), pictures, and a short list of things the person would like to do (again
right now). This information (demographics & pictures) could be provided
explicitly by the user, or he/she could login through Facebook to streamline
the process.

When two people “match,” their locations are shared with each other on a map
and they are then free to meet up. A chat client would be available for those
that feel the need to make contact prior to the first face-to-face meeting.
However, we would push users to meet with people rather than exchange messages.
The idea, in essence, is to combine the availability toggle of Uber/Lyft’s
“driver mode” with the instant feedback of Tinder’s “match” system. The app
would be meant for people who have some spare time (e.g. “2 hour break between
classes...anyone want to chat over some coffee?”) and would like to meet other
available people around them.

###Setup Development Environment
* Install Node.js
  * Download and install from nodejs.org
* Install Cordova and Ionic
  * (Mac) Open terminal: sudo npm-install -g cordova ionic
* Clone this repo: git clone https://github.com/michaeljng/meetmeapp.git
* In project directory run: ionic serve