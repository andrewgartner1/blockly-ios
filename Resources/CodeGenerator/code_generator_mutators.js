/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 This file contains all custom `domToMutation(xmlElement)` functions for known default mutator
 blocks.
 */

CodeGeneratorBridge.BlockDomToMutation["controls_if"] = function(xmlElement) {
  var elseifCount = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
  var elseCount = parseInt(xmlElement.getAttribute('else'), 10) || 0;

  // Remove existing inputs
  if (this.getInput('ELSE')) {
    this.removeInput('ELSE');
  }
  var i = 1;
  while (this.getInput('IF' + i)) {
    this.removeInput('IF' + i);
    this.removeInput('DO' + i);
    i++;
  }
  // Rebuild block.
  for (var i = 1; i <= elseifCount; i++) {
    this.appendValueInput('IF' + i)
    .setCheck('Boolean')
    .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
    this.appendStatementInput('DO' + i)
    .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
  }
  if (elseCount) {
    this.appendStatementInput('ELSE')
    .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
  }
};

CodeGeneratorBridge.BlockDomToMutation["procedures_defnoreturn"] = function(xmlElement) {
  // Update arguments.
  // NOTE: `this.arguments_` is used by the default code generators, which is why it's added here to
  // the block object.
  this.arguments_ = [];
  for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
    if (childNode.nodeName.toLowerCase() == 'arg') {
      this.arguments_.push(childNode.getAttribute('name'));
    }
  }
  // Merge the arguments into a human-readable list.
  var paramString = '';
  if (this.arguments_.length) {
    paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS + ' ' + this.arguments_.join(', ');
  }
  this.setFieldValue(paramString, 'PARAMS');

  // Show or hide the statement input.
  var hasStatements = (xmlElement.getAttribute('statements') !== 'false');
  if (hasStatements) {
    this.appendStatementInput('STACK')
    .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
    if (this.getInput('RETURN')) {
      this.moveInputBefore('STACK', 'RETURN');
    }
  } else {
    this.removeInput('STACK', true);
  }
};

CodeGeneratorBridge.BlockDomToMutation["procedures_defreturn"] =
  CodeGeneratorBridge.BlockDomToMutation["procedures_defnoreturn"];

CodeGeneratorBridge.BlockDomToMutation["procedures_callnoreturn"] = function(xmlElement) {
  // Update procedure name.
  var name = xmlElement.getAttribute('name');
  this.setFieldValue(name, 'NAME');

  // Update arguments.
  // NOTE: `this.arguments_` is used by the default code generators, which is why it's added here to
  // the block object.
  this.arguments_ = [];
  for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
    if (childNode.nodeName.toLowerCase() == 'arg') {
      this.arguments_.push(childNode.getAttribute('name'));
    }
  }

  // Update inputs
  for (var i = 0; i < this.arguments_.length; i++) {
    var field = this.getField('ARGNAME' + i);
    if (field) {
      // Ensure argument name is up to date.
      field.setValue(this.arguments_[i]);
    } else {
      // Add new input.
      field = new Blockly.FieldLabel(this.arguments_[i]);
      var input = this.appendValueInput('ARG' + i)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(field, 'ARGNAME' + i);
      input.init();
    }
  }
  // Remove deleted inputs.
  while (this.getInput('ARG' + i)) {
    this.removeInput('ARG' + i);
    i++;
  }
  // Add 'with:' if there are parameters, remove otherwise (this may be unnecessary to code
  // generation, but adding it here just to be safe).
  var topRow = this.getInput('TOPROW');
  if (topRow) {
    if (this.arguments_.length) {
      if (!this.getField('WITH')) {
        topRow.appendField(Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS, 'WITH');
        topRow.init();
      }
    } else {
      if (this.getField('WITH')) {
        topRow.removeField('WITH');
      }
    }
  }
};

CodeGeneratorBridge.BlockDomToMutation["procedures_callreturn"] =
  CodeGeneratorBridge.BlockDomToMutation["procedures_callnoreturn"];

CodeGeneratorBridge.BlockDomToMutation["procedures_ifreturn"] = function(xmlElement) {
  // NOTE: `this.hasReturnValue_` is used by the default code generators, which is why it's added
  // here to the block object.
  var value = xmlElement.getAttribute('value');
  this.hasReturnValue_ = (value == 1);
  if (!this.hasReturnValue_) {
    this.removeInput('VALUE');
    this.appendDummyInput('VALUE')
    .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
  }
};
