import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/role.enum';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Get all users
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Get pending users
  @Roles(UserRole.ADMIN)
  @Get('pending')
  findPending() {
    return this.usersService.findPending();
  }

  // Approve user
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approveUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.approveUser(id);
  }

  // Suspend user
  @Roles(UserRole.ADMIN)
  @Patch(':id/suspend')
  suspendUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.suspendUser(id);
  }

  // Delete user
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
  @Roles(UserRole.ADMIN)
@Patch(':id/reject')
rejectUser(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.rejectUser(id);
}
@Roles(UserRole.ADMIN)
@Patch(':id/reset-password')
resetPassword(
  @Param('id', ParseIntPipe) id: number,
  @Body('password') password: string,
) {
  return this.usersService.resetPassword(id, password);
}
@Roles(UserRole.ADMIN)
@Get('approved-contractors')
getApprovedContractors() {
  return this.usersService.findApprovedContractors();
}
@Get('public/email/:email')
getUserByEmailPublic(@Param('email') email: string) {
  return this.usersService.findByEmail(email);
}
@Roles(UserRole.ADMIN)
@Patch(':id/activate')
activateUser(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.activateUser(id);
}
}