import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  include MixinStorage();

  // Persistent state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type Profile = {
    displayName : Text;
    bio : Text;
    avatar : ?ExternalBlob.ExternalBlob;
    website : Text;
    location : Text;
    gender : Text;
    birthday : Text;
    relationshipStatus : Text;
    interests : Text;
    hobbies : Text;
    favMovies : Text;
    favSongs : Text;
    education : Text;
    thoughts : Text;
    coverPhoto : ?ExternalBlob.ExternalBlob;
  };

  public type Message = {
    from : Principal;
    to : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Comment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Post = {
    id : Nat;
    author : Principal;
    content : Text;
    image : ?ExternalBlob.ExternalBlob;
    timestamp : Time.Time;
    likes : Set.Set<Principal>;
    comments : List.List<Comment>;
  };

  public type PostDTO = {
    id : Nat;
    author : Principal;
    content : Text;
    image : ?ExternalBlob.ExternalBlob;
    timestamp : Time.Time;
    likes : [Principal];
    comments : [Comment];
  };

  public type Story = {
    author : Principal;
    content : Text;
    image : ?ExternalBlob.ExternalBlob;
    timestamp : Time.Time;
  };

  public type TinderLike = {
    from : Principal;
    to : Principal;
  };

  public type Notification = {
    id : Nat;
    kind : Text;
    fromUser : Principal;
    targetId : Nat;
    read : Bool;
    timestamp : Time.Time;
  };

  module Comment {
    public func compareByTimestamp(a : Comment, b : Comment) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module Post {
    public func compareByTimestamp(a : Post, b : Post) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module Story {
    public func compareByTimestamp(a : Story, b : Story) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module Message {
    public func compareByTimestamp(a : Message, b : Message) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // Persistent Fields (now defined through migration only)
  var profiles = Map.empty<Principal, Profile>();
  var followers = Map.empty<Principal, Set.Set<Principal>>();
  var following = Map.empty<Principal, Set.Set<Principal>>();
  var posts = Map.empty<Nat, Post>();
  var stories = Map.empty<Principal, List.List<Story>>();
  var storyHighlights = Map.empty<Principal, List.List<Story>>();
  var messages = Map.empty<Principal, List.List<Message>>();
  var tinderLikes = List.empty<TinderLike>();
  var friends = Map.empty<Principal, Set.Set<Principal>>();
  var notifications = Map.empty<Principal, List.List<Notification>>();
  var nextPostId = 0;
  var nextCommentId = 0;
  var nextNotificationId = 0;
  var starsReceived = Map.empty<Principal, Set.Set<Principal>>();

  // Helper functions to check if user exists
  func assertUserExists(principal : Principal) {
    if (not profiles.containsKey(principal)) {
      Runtime.trap("User does not exist");
    };
  };

  func getUserProfileInternal(principal : Principal) : Profile {
    switch (profiles.get(principal)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User does not exist") };
    };
  };

  // Add notification
  func addNotification(to : Principal, kind : Text, fromUser : Principal, targetId : Nat) {
    let notification : Notification = {
      id = nextNotificationId;
      kind;
      fromUser;
      targetId;
      read = false;
      timestamp = Time.now();
    };

    switch (notifications.get(to)) {
      case (?existingNotifs) {
        existingNotifs.add(notification);
        notifications.add(to, existingNotifs);
      };
      case (null) {
        let newNotifs = List.empty<Notification>();
        newNotifs.add(notification);
        notifications.add(to, newNotifs);
      };
    };

    nextNotificationId += 1;
  };

  // Profiles
  public query ({ caller }) func getProfile(user : Principal) : async Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    getUserProfileInternal(user);
  };

  public query ({ caller }) func getAllProfiles() : async [(Principal, Profile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.toArray();
  };

  public shared ({ caller }) func updateProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func createProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (profiles.containsKey(caller)) {
      Runtime.trap("User already exists");
    };
    profiles.add(caller, profile);
  };

  // Posts
  public shared ({ caller }) func createPost(content : Text, image : ?ExternalBlob.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    assertUserExists(caller);

    let post : Post = {
      id = nextPostId;
      author = caller;
      content;
      image;
      timestamp = Time.now();
      likes = Set.empty<Principal>();
      comments = List.empty<Comment>();
    };

    posts.add(nextPostId, post);
    nextPostId += 1;
  };

  func postToDTO(post : Post) : PostDTO {
    {
      id = post.id;
      author = post.author;
      content = post.content;
      image = post.image;
      timestamp = post.timestamp;
      likes = post.likes.toArray();
      comments = post.comments.toArray();
    };
  };

  func postIterToDTOIter(iter : Iter.Iter<Post>) : Iter.Iter<PostDTO> {
    iter.map<Post, PostDTO>(postToDTO);
  };

  public query ({ caller }) func getAllPosts() : async [PostDTO] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    postIterToDTOIter(posts.values()).toArray().sort(
      func(p1, p2) { Int.compare(p1.timestamp, p2.timestamp) }
    );
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [PostDTO] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    assertUserExists(user);
    postIterToDTOIter(
      posts.values().filter(
        func(p) { p.author == user }
      )
    ).toArray().sort(
      func(p1, p2) { Int.compare(p1.timestamp, p2.timestamp) }
    );
  };

  public shared ({ caller }) func commentOnPost(postId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };
    assertUserExists(caller);

    switch (posts.get(postId)) {
      case (?post) {
        let comment : Comment = {
          id = nextCommentId;
          author = caller;
          content;
          timestamp = Time.now();
        };

        post.comments.add(comment);
        posts.add(postId, post);
        nextCommentId += 1;

        addNotification(post.author, "comment", caller, postId);
      };
      case (null) { Runtime.trap("Post does not exist") };
    };
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    assertUserExists(caller);

    switch (posts.get(postId)) {
      case (?post) {
        post.likes.add(caller);
        posts.add(postId, post);

        addNotification(post.author, "like", caller, postId);
      };
      case (null) { Runtime.trap("Post does not exist") };
    };
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    assertUserExists(caller);

    switch (posts.get(postId)) {
      case (?post) {
        post.likes.remove(caller);
        posts.add(postId, post);
      };
      case (null) { Runtime.trap("Post does not exist") };
    };
  };

  // Followers/Following
  public shared ({ caller }) func follow(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    assertUserExists(user);
    assertUserExists(caller);

    switch (followers.get(user)) {
      case (?followers) {
        followers.add(caller);
      };
      case (null) {
        let newFollowers = Set.empty<Principal>();
        newFollowers.add(caller);
        followers.add(user, newFollowers);
      };
    };

    switch (following.get(caller)) {
      case (?following) {
        following.add(user);
      };
      case (null) {
        let newFollowing = Set.empty<Principal>();
        newFollowing.add(user);
        following.add(caller, newFollowing);
      };
    };

    addNotification(user, "follow", caller, 0);
  };

  public shared ({ caller }) func unfollow(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    assertUserExists(user);
    assertUserExists(caller);

    switch (followers.get(user)) {
      case (?followers) {
        followers.remove(caller);
      };
      case (null) { Runtime.trap("Not following") };
    };

    switch (following.get(caller)) {
      case (?following) {
        following.remove(user);
      };
      case (null) { Runtime.trap("Not following") };
    };
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };
    assertUserExists(user);

    switch (followers.get(user)) {
      case (?followers) { followers.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following");
    };
    assertUserExists(user);

    switch (following.get(user)) {
      case (?following) { following.toArray() };
      case (null) { [] };
    };
  };

  // Friends/Matches
  public shared ({ caller }) func acceptRequest(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept requests");
    };
    assertUserExists(user);
    assertUserExists(caller);

    // Verify that the user actually sent a tinder like to caller
    let hasRequest = tinderLikes.toArray().find(
      func(like) {
        like.from == user and like.to == caller;
      }
    );

    switch (hasRequest) {
      case (null) {
        Runtime.trap("No pending request from this user");
      };
      case (_) {
        // Add each other as friends
        let addFriend = func(map : Map.Map<Principal, Set.Set<Principal>>, key1 : Principal, key2 : Principal) {
          switch (map.get(key1)) {
            case (?friendsSet) {
              friendsSet.add(key2);
            };
            case (null) {
              let newFriends = Set.empty<Principal>();
              newFriends.add(key2);
              map.add(key1, newFriends);
            };
          };
        };

        addFriend(friends, caller, user);
        addFriend(friends, user, caller);

        // Create a mutual tinder like (caller likes user back)
        let mutualLike : TinderLike = { from = caller; to = user };
        tinderLikes.add(mutualLike);

        addNotification(user, "friend_accept", caller, 0);
        addNotification(caller, "friend_accept", user, 0);
      };
    };
  };

  public query ({ caller }) func getFriends() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get friends");
    };
    assertUserExists(caller);

    switch (friends.get(caller)) {
      case (?friendsSet) { friendsSet.toArray() };
      case (null) { [] };
    };
  };

  // Stories
  public shared ({ caller }) func createStory(content : Text, image : ?ExternalBlob.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };
    assertUserExists(caller);

    let story : Story = {
      author = caller;
      content;
      image;
      timestamp = Time.now();
    };

    switch (stories.get(caller)) {
      case (?existingStories) {
        existingStories.add(story);
        stories.add(caller, existingStories);
      };
      case (null) {
        let newStories = List.empty<Story>();
        newStories.add(story);
        stories.add(caller, newStories);
      };
    };
  };

  public query ({ caller }) func getStories(user : Principal) : async [Story] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };
    assertUserExists(user);

    switch (stories.get(user)) {
      case (?storyList) {
        storyList.toArray().filter(
          func(story) { Time.now() - story.timestamp < 24 * 60 * 60 * 1_000_000_000 }
        );
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func saveStoryToHighlight(storyIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save story highlights");
    };
    assertUserExists(caller);

    switch (stories.get(caller)) {
      case (?userStories) {
        let userStoriesArray = userStories.toArray().sort(
          func(s1, s2) { Int.compare(s2.timestamp, s1.timestamp) }
        );
        if (storyIndex >= userStoriesArray.size()) {
          Runtime.trap("Invalid story index");
        };

        let newHighlight = List.empty<Story>();
        newHighlight.add(userStoriesArray[storyIndex]);

        switch (storyHighlights.get(caller)) {
          case (?existingHighlights) {
            existingHighlights.add(userStoriesArray[storyIndex]);
            storyHighlights.add(caller, existingHighlights);
          };
          case (null) {
            storyHighlights.add(caller, newHighlight);
          };
        };
      };
      case (null) { Runtime.trap("Story not found") };
    };
  };

  public query ({ caller }) func getStoryHighlights(user : Principal) : async [Story] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get story highlights");
    };
    assertUserExists(user);

    switch (storyHighlights.get(user)) {
      case (?highlights) { highlights.toArray() };
      case (null) { [] };
    };
  };

  // Direct Messages
  public shared ({ caller }) func sendMessage(to : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    assertUserExists(caller);
    assertUserExists(to);

    let message : Message = {
      from = caller;
      to;
      content;
      timestamp = Time.now();
    };

    switch (messages.get(caller)) {
      case (?senderMessages) {
        senderMessages.add(message);
        messages.add(caller, senderMessages);
      };
      case (null) {
        let newMessages = List.empty<Message>();
        newMessages.add(message);
        messages.add(caller, newMessages);
      };
    };

    switch (messages.get(to)) {
      case (?receiverMessages) {
        receiverMessages.add(message);
        messages.add(to, receiverMessages);
      };
      case (null) {
        let newMessages = List.empty<Message>();
        newMessages.add(message);
        messages.add(to, newMessages);
      };
    };
  };

  public query ({ caller }) func getMessages(partner : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    assertUserExists(caller);

    switch (messages.get(caller)) {
      case (?senderMessages) {
        let filteredMessages = senderMessages.toArray().filter(
          func(msg) {
            (msg.from == caller and msg.to == partner) or
            (msg.from == partner and msg.to == caller)
          }
        );
        filteredMessages.sort(Message.compareByTimestamp);
      };
      case (null) { [] };
    };
  };

  // Tinder-style Discovery
  public shared ({ caller }) func tinderLike(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like in Tinder discovery");
    };
    assertUserExists(user);
    assertUserExists(caller);

    let newLike : TinderLike = { from = caller; to = user };
    tinderLikes.add(newLike);

    // Check for match
    let hasMatch = tinderLikes.toArray().find(
      func(like) {
        like.from == user and like.to == caller;
      }
    );

    switch (hasMatch) {
      case null {};
      case (_) {
        addNotification(caller, "match", user, 0);
        addNotification(user, "match", caller, 0);
      };
    };
  };

  public shared ({ caller }) func tinderPass(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can pass in Tinder discovery");
    };
    assertUserExists(user);
    assertUserExists(caller);
    // Pass implementation (no-op, just for record)
  };

  public query ({ caller }) func getMatches() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get matches");
    };
    let matches = List.empty<Principal>();

    for (like in tinderLikes.values()) {
      if (like.from == caller) {
        let hasMatch = tinderLikes.toArray().find(
          func(l) { l.from == like.to and l.to == caller }
        );
        switch (hasMatch) {
          case null {};
          case (_) { matches.add(like.to) };
        };
      };
    };

    matches.toArray();
  };

  public query ({ caller }) func getTinderQueue() : async [(Principal, Profile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get Tinder queue");
    };
    profiles.toArray().filter(
      func((_principal, profile)) {
        profile.displayName.contains(#text "");
      }
    ).map(func((principal, profile)) { (principal, profile) });
  };

  // Notifications
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get notifications");
    };
    switch (notifications.get(caller)) {
      case (?notificationsList) {
        notificationsList.toArray().sort(
          func(n1, n2) { Int.compare(n2.timestamp, n1.timestamp) }
        );
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func markNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (notifications.get(caller)) {
      case (?notificationsList) {
        let updatedNotifications = notificationsList.map<Notification, Notification>(
          func(n) { { n with read = true } }
        );
        notifications.add(caller, updatedNotifications);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get unread notification count");
    };
    switch (notifications.get(caller)) {
      case (?notificationsList) {
        notificationsList.toArray().filter(
          func(n) { not n.read }
        ).size();
      };
      case (null) { 0 };
    };
  };

  // Discover/Search
  public query ({ caller }) func searchUsers(term : Text) : async [(Principal, Profile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search");
    };
    profiles.toArray().filter(
      func((_, profile)) { profile.displayName.contains(#text term) }
    );
  };

  // Required profile management functions for frontend
  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  // Star feature
  public shared ({ caller }) func starUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can star profiles");
    };
    assertUserExists(user);

    let existingStars = switch (starsReceived.get(user)) {
      case (?stars) { stars };
      case (null) {
        let newStars = Set.empty<Principal>();
        starsReceived.add(user, newStars);
        newStars;
      };
    };

    if (existingStars.contains(caller)) {
      Runtime.trap("Already starred this profile");
    };

    existingStars.add(caller);
  };

  public query ({ caller }) func getStarsReceived() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stars");
    };
    switch (starsReceived.get(caller)) {
      case (?stars) { stars.size() };
      case (null) { 0 };
    };
  };
};
