<?php

namespace App\Exceptions;

use App\Common\Exceptions\ExceptionTrait;

class CSRFInvalidationException extends \Exception
{
    use ExceptionTrait;
    
    const CODE    = 400;
    const MESSAGE = 'Could not confirm the CSRF token from SSO Provider. Please try again.';
}
