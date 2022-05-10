var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const authAdmin = require("./authAdminr.js")//判斷登入狀態及權限
//session
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);


var indexRouter = require('./routes/index');
var backendMembersRouter = require('./routes/backendMembers');//ACCESS
var backendFinanceRouter = require('./routes/backendFinance');
var backendAgencyRouter = require('./routes/backendAgency');
var backendRiskRouter = require('./routes/backendRisk');
var backendManagementRouter = require('./routes/backendManagement');
var memberPagesRouter = require('./routes/backendMemberPages');
var backendLayerRouter = require('./routes/backendLayer');
var backendCasinoRouter = require('./routes/backendCasino');
var backendReportRouter = require('./routes/backendReport');
var MembersRouter = require('./routes/Members');





const ip = require("ip");

var cors = require('cors');
var app = express();

/*
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', '*');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);
app.use(cors());

var options = {
  host     : 'localhost',
  port: 3306,
  user     : 'Casino',
  password : 'nM5ATG5wzk5HaRwX',
  database : 'Casino'	//數據庫名
};
var sessionStore = new MySQLStore(options);
app.use(session({
  key: 'elmonight',	//自行設置的簽名
  secret: "keysec2sjja",		//密匙
  store: sessionStore,		//存儲管理器
  resave: false,
  saveUninitialized: false
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bankImages', express.static(path.join(__dirname, 'uploads/finance')));//銀行列表圖片
app.use('/membersImages', express.static(path.join(__dirname, 'uploads/members')));//會員圖片


app.use('/backend',  indexRouter);
app.use('/backend/members',  backendMembersRouter);
app.use('/backend/financ', backendFinanceRouter);
app.use('/backend/agency', backendAgencyRouter);
app.use('/backend/risk', backendRiskRouter);
app.use('/backend/memberPages', memberPagesRouter);
app.use('/backend/management', backendManagementRouter);
app.use('/backend/layer', backendLayerRouter);
app.use('/backend/casino', backendCasinoRouter);
app.use('/backend/report', backendReportRouter);

/* 有加判斷登入
app.use('/backend', authAdmin.adminRequired, indexRouter);
app.use('/backend/members', authAdmin.adminRequired, backendMembersRouter);
app.use('/backend/financ', authAdmin.adminRequired, backendFinanceRouter);
app.use('/backend/agency', authAdmin.adminRequired, backendAgencyRouter);
*/

app.use('/member', MembersRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
