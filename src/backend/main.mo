import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Product Types and Categories
  type Category = {
    #bolsas;
    #maquillaje;
    #perfumes;
  };

  module Category {
    public func fromText(category : Text) : ?Category {
      switch (category) {
        case ("Bolsas") { ?#bolsas };
        case ("bolsas") { ?#bolsas };
        case ("Maquillaje") { ?#maquillaje };
        case ("maquillaje") { ?#maquillaje };
        case ("Perfumes") { ?#perfumes };
        case ("perfumes") { ?#perfumes };
        case (_) { null };
      };
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    price : Float;
    description : Text;
    productCode : Text;
    category : Category;
    imageId : ?Text;
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // State Management
  let products = Map.empty<Nat, Product>();
  var currentId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (no auth check — access controlled via frontend admin password)
  public shared func addProduct(name : Text, price : Float, description : Text, productCode : Text, category : Text, imageId : ?Text) : async () {
    let validCategory = switch (Category.fromText(category)) {
      case (null) { Runtime.trap("Invalid category: " # category) };
      case (?cat) { cat };
    };

    let newProduct : Product = {
      id = currentId;
      name;
      price;
      description;
      productCode;
      category = validCategory;
      imageId;
    };

    products.add(currentId, newProduct);
    currentId += 1;
  };

  public shared func updateProduct(id : Nat, name : Text, price : Float, description : Text, productCode : Text, category : Text, imageId : ?Text) : async () {
    let validCategory = switch (Category.fromText(category)) {
      case (null) { Runtime.trap("Invalid category: " # category) };
      case (?cat) { cat };
    };

    let updatedProduct : Product = {
      id;
      name;
      price;
      description;
      productCode;
      category = validCategory;
      imageId;
    };

    products.add(id, updatedProduct);
  };

  public shared func deleteProduct(id : Nat) : async () {
    products.remove(id);
  };

  // Public Queries
  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    let validCategory = switch (Category.fromText(category)) {
      case (null) { Runtime.trap("Invalid category: " # category) };
      case (?cat) { cat };
    };
    products.values().toArray().filter(
      func(p) {
        p.category == validCategory;
      }
    );
  };
};
