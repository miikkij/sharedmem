import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import slug from "slug";
const Schema = mongoose.Schema;

// create a schema
const exampleSchema = new Schema(
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

exampleSchema.plugin(uniqueValidator, { message: "is already taken" });

exampleSchema.pre("validate", function(next) {
  this.slugify();
  next();
});

exampleSchema.methods.slugify = function() {
  this.slug = slug(this.title);
};

// Minimal JSON Response for User

exampleSchema.methods.toJSONForUser = function() {
  let value = Object.assign({}, this);

  // Remove fields from return value here
  delete value._doc._id;

  return value;
};

// Custom JSON For Administrator

exampleSchema.methods.toJSONForAdministrator = function() {
  let value = Object.assign({}, this);

  // Remove fields from return value here

  return value;
};

// the schema is useless so far
// we need to create a model using it
const Example = mongoose.model("Example", exampleSchema);

// make this available in our applications
export default Example;
