require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const connectDB = require("./config/db");

// Routes
const adminRoutes = require("./routes/adminRoutes");
const frontendRoutes = require("./routes/frontendRoutes");

const app = express();

/* ===============================
   Database Connection
================================ */
connectDB();

/* ===============================
   Middlewares
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ===============================
   Session Setup
================================ */
app.use(
   session({
      name: "portfolio_session",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
         mongoUrl: process.env.MONGO_URI,
         collectionName: "sessions"
      }),
      cookie: {
         httpOnly: true,
         secure: false, // true in production (HTTPS)
         maxAge: 1000 * 60 * 60 * 24 // 1 day
      }
   })
);

/* ===============================
   Flash Messages
================================ */
app.use(flash());

/* ===============================
   View Engine Setup
================================ */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

/* ===============================
   Static Files
================================ */
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   Global Variables
================================ */
app.use((req, res, next) => {
   res.locals.admin = req.session.admin || null;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

/* ===============================
   Routes
================================ */
app.use("/", frontendRoutes);
app.use("/admin", adminRoutes);

/* ===============================
   404 Handler
================================ */
app.use((req, res) => {
   res.status(404).render("frontend/404", { title: "Page Not Found" });
});

/* ===============================
   Server
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
   console.log(`🚀 Server running on http://localhost:${PORT}`)
);
