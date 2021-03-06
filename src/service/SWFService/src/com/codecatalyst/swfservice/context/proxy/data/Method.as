////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2008-2013 CodeCatalyst, LLC - http://www.codecatalyst.com/
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.	
////////////////////////////////////////////////////////////////////////////////

package com.codecatalyst.swfservice.context.proxy.data
{
	/**
	 * @private
	 */
	public class Method
	{
		// ========================================
		// Protected properties
		// ========================================
		
		/**
		 * Backing variable for <code>name</code>.
		 */
		protected var _name:String = null;
		
		/**
		 * Backing variable for <code>parameters</code>.
		 */
		protected var _parameters:Array = null;
		
		/**
		 * Backing variable for <code>returnType</code>.
		 */
		protected var _returnType:String = null;
		
		// ========================================
		// Public properties
		// ========================================
		
		/**
		 * Method name.
		 */
		public function get name():String
		{
			return _name;
		}
		
		/**
		 * Method parameters.
		 */
		public function get parameters():Array
		{
			return _parameters;
		}
		
		/**
		 * Method return type.
		 */
		public function get returnType():String
		{
			return _returnType;
		}
		
		// ========================================
		// Constructor
		// ========================================
		
		public function Method( name:String, parameters:Array, returnType:String )
		{
			super();
			
			this._name = name;
			this._parameters = parameters;
			this._returnType = returnType;
		}
	}
}