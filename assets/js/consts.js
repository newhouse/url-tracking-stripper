'use strict';

const Consts = {
  REASON_INSTALL                                    : 'install',
  REASON_UPDATE                                     : 'update',

  // CONSTS
  STORAGE_KEY_STRIPPING_METHOD_TO_USE               : 'STRIPPING_METHOD_TO_USE',
  STORAGE_KEY_SKIP_KNOWN_REDIRECTS                  : 'SKIP_KNOWN_REDIRECTS',
  STRIPPING_METHOD_HISTORY_CHANGE                   : 1,
  STRIPPING_METHOD_CANCEL_AND_RELOAD                : 2, // DEPRECATED
  STRIPPING_METHOD_BLOCK_AND_RELOAD                 : 3,
  STRIPPING_METHOD_BLOCK_AND_RELOAD_SKIP_REDIRECTS  : 4,

  ACTION_RELOAD_AND_ALLOW_PARAMS                    : 'reload_and_allow_params',
  ACTION_OPTIONS_SAVED                              : 'options_saved',
  ACTION_GET_STUFF_BY_STRIPPING_METHOD_ID           : 'get_stuff_by_stripping_method_id',

  // Need to be User-friendly looking as they're used for display purposes
  CHANGE_TYPE_TRACKING_STRIP                        : 'Tracking Stripped',
  CHANGE_TYPE_REDIRECT_SKIP                         : 'Redirect Skipped',

  CONTEXT_MENU_ITEM_ID                              : 'COPY_AND_CLEAN',
  CONTEXT_MENU_ITEM_TEXT                            : 'Copy, Skip, and Strip Link'
};

// Default Stripping Method to use when in doubt.
Consts.DEFAULT_STRIPPING_METHOD = Consts.STRIPPING_METHOD_BLOCK_AND_RELOAD_SKIP_REDIRECTS;

module.exports = Consts;