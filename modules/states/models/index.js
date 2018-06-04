import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import slug from "slug";
const Schema = mongoose.Schema;

// create a schema
const stateSchema = new Schema(
  {
    title: {
      type: String
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["Active", "Archived", "Deleted"],
      default: "Active"
    },
    meta_data: {
      type: Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

stateSchema.plugin(uniqueValidator, { message: "is already taken" });

stateSchema.pre("validate", function(next) {
  this.slugify();
  next();
});

stateSchema.methods.slugify = function() {
  this.slug = slug(this.title);
};

// Minimal JSON Response for User

stateSchema.methods.toJSONForUser = function() {
  let value = Object.assign({}, this);

  // Remove fields from return value here
  delete value._doc._id;

  return value;
};

// Custom JSON For Administrator

stateSchema.methods.toJSONForAdministrator = function() {
  let value = Object.assign({}, this);

  // Remove fields from return value here

  return value;
};

// the schema is useless so far
// we need to create a model using it
const State = mongoose.model("State", stateSchema);

// make this available in our applications
export default State;
