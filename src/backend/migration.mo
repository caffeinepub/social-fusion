import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type OldProfile = {
    displayName : Text;
    bio : Text;
    avatar : ?ExternalBlob.ExternalBlob;
  };

  type NewProfile = {
    displayName : Text;
    bio : Text;
    avatar : ?ExternalBlob.ExternalBlob;
    website : Text;
    location : Text;
    gender : Text;
    birthday : Text;
    relationshipStatus : Text;
  };

  type Message = {
    from : Principal;
    to : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Comment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Post = {
    id : Nat;
    author : Principal;
    content : Text;
    image : ?ExternalBlob.ExternalBlob;
    timestamp : Time.Time;
    likes : Set.Set<Principal>;
    comments : List.List<Comment>;
  };

  type Story = {
    author : Principal;
    content : Text;
    image : ?ExternalBlob.ExternalBlob;
    timestamp : Time.Time;
  };

  type TinderLike = {
    from : Principal;
    to : Principal;
  };

  type Notification = {
    id : Nat;
    kind : Text;
    fromUser : Principal;
    targetId : Nat;
    read : Bool;
    timestamp : Time.Time;
  };

  type OldSocialFusionState = {
    profiles : Map.Map<Principal, OldProfile>;
    followers : Map.Map<Principal, Set.Set<Principal>>;
    following : Map.Map<Principal, Set.Set<Principal>>;
    posts : Map.Map<Nat, Post>;
    stories : Map.Map<Principal, List.List<Story>>;
    messages : Map.Map<Principal, List.List<Message>>;
    nextPostId : Nat;
    nextCommentId : Nat;
  };

  type OldActorState = {
    socialFusionState : OldSocialFusionState;
  };

  // New state with expanded profiles
  type NewActorState = {
    profiles : Map.Map<Principal, NewProfile>;
    followers : Map.Map<Principal, Set.Set<Principal>>;
    following : Map.Map<Principal, Set.Set<Principal>>;
    posts : Map.Map<Nat, Post>;
    stories : Map.Map<Principal, List.List<Story>>;
    messages : Map.Map<Principal, List.List<Message>>;
    tinderLikes : List.List<TinderLike>;
    notifications : Map.Map<Principal, List.List<Notification>>;
    nextPostId : Nat;
    nextCommentId : Nat;
    nextNotificationId : Nat;
  };

  // Migration function
  public func run(old : OldActorState) : NewActorState {
    let newProfiles = old.socialFusionState.profiles.map<Principal, OldProfile, NewProfile>(
      func(_p, oldProfile) {
        {
          oldProfile with
          website = "";
          location = "";
          gender = "";
          birthday = "";
          relationshipStatus = "";
        };
      }
    );

    {
      profiles = newProfiles;
      followers = old.socialFusionState.followers;
      following = old.socialFusionState.following;
      posts = old.socialFusionState.posts;
      stories = old.socialFusionState.stories;
      messages = old.socialFusionState.messages;
      tinderLikes = List.empty<TinderLike>();
      notifications = Map.empty<Principal, List.List<Notification>>();
      nextPostId = old.socialFusionState.nextPostId;
      nextCommentId = old.socialFusionState.nextCommentId;
      nextNotificationId = 0;
    };
  };
};
