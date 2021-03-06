const { expect, sinon } = require('test/util/chai');
const config = require('config');

const modulePath = 'app/middleware/submissionMiddleware';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};
let ctx = {};

const currentDeploymentEnv = config.deployment_env;
const features = config.features;
const currentRedirectSubmittedFlag = features.redirectToApplicationSubmitted;

describe(modulePath, () => {
  describe('#hasSubmitted', () => {
    beforeEach(() => {
      ctx = { };
      req = { session: {} };
      res = { redirect: sinon.stub() };
      next = sinon.stub();
      features.redirectToApplicationSubmitted = false;
    });
    afterEach(() => {
      config.deployment_env = currentDeploymentEnv;
      features.redirectToApplicationSubmitted = currentRedirectSubmittedFlag;
    });
    it('calls next if application has not been submitted', () => {
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    it('next is not called if env is prod', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(false);
    });
    it('next is called if env is not prod', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'no prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(true);
    });
    it('next is called if session.caseId does not exist', () => {
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(true);
    });
    it('next is called if session.state does not exist', () => {
      req.session.caseId = 'someid';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(true);
    });
    it('redirects to /application-submitted if application has been submitted and is in "AwaitingPayment"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is not "AwaitingPayment" or "Rejected"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'randomstate';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('calls next if application has been submitted and is "Rejected"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'Rejected';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    context('new case submitted with no state', () => {
      it('redirects to application submitted when redirect feature is set to true and caseId is in session', () => {
        req.session.caseId = 'someid';
        features.redirectToApplicationSubmitted = true;
        underTest.hasSubmitted.apply(ctx, [req, res, next]);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(res.redirect.calledWith('/application-submitted')).to.eql(true);
      });

      it('calls next when redirect feature is set to true but caseId is not in session', () => {
        features.redirectToApplicationSubmitted = true;
        underTest.hasSubmitted.apply(ctx, [req, res, next]);
        expect(res.redirect.called).to.eql(false);
        expect(next.calledOnce).to.eql(true);
      });
    });
  });
});
