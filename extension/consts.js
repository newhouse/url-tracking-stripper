'use strict';

const REASON_INSTALL                                    = 'install';
const REASON_UPDATE                                     = 'update';

// CONSTS
const STORAGE_KEY_STRIPPING_METHOD_TO_USE               = 'STRIPPING_METHOD_TO_USE';
const STORAGE_KEY_SKIP_KNOWN_REDIRECTS                  = 'SKIP_KNOWN_REDIRECTS';
const STRIPPING_METHOD_HISTORY_CHANGE                   = 1;
const STRIPPING_METHOD_CANCEL_AND_RELOAD                = 2; // DEPRECATED
const STRIPPING_METHOD_BLOCK_AND_RELOAD                 = 3;
const STRIPPING_METHOD_BLOCK_AND_RELOAD_SKIP_REDIRECTS  = 4;

const ACTION_RELOAD_AND_ALLOW_PARAMS                    = 'reload_and_allow_params';
const ACTION_OPTIONS_SAVED                              = 'options_saved';

// Need to be User-friendly looking as they're used for display purposes
const CHANGE_TYPE_TRACKING_STRIP                        = 'Tracking Stripped';
const CHANGE_TYPE_REDIRECT_SKIP                         = 'Redirect Skipped';