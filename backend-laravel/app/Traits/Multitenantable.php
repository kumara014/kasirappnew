<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait Multitenantable
{
    public static function bootMultitenantable()
    {
        if (Auth::check()) {
            static::creating(function ($model) {
                $column = defined('static::TENANT_COLUMN') ? static::TENANT_COLUMN : 'user_id';
                if (!$model->$column) {
                    $model->$column = Auth::user()->getOwnerId();
                }
            });

            static::addGlobalScope('user_scope', function (Builder $builder) {
                $column = defined('static::TENANT_COLUMN') ? static::TENANT_COLUMN : 'user_id';
                $builder->where($builder->getQuery()->from . '.' . $column, Auth::user()->getOwnerId());
            });
        }
    }
}
